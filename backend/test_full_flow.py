
import os
import django
from django.utils import timezone
from datetime import timedelta
import json

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from core.models import User, Institute
from academics.models import Program, Batch, Course, Enrollment, Submission, Assignment

def run_e2e_test():
    print("="*60)
    print("STARTING END-TO-END SYSTEM TEST")
    print("="*60)
    
    client = APIClient()

    # --- 0. Setup Users ---
    print("\n[Step 0] Setting up Users...")
    # Admin
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin_test', 'admin@test.com', 'admin123')
    
    # Instructor
    instructor, _ = User.objects.get_or_create(username='auto_instructor', defaults={
        'email': 'inst@test.com', 'role': 'INSTRUCTOR', 'first_name': 'Dr.', 'last_name': 'Strange'
    })
    instructor.set_password('pass123')
    instructor.save()
    
    # Student
    student, _ = User.objects.get_or_create(username='alex_student', defaults={
        'email': 'alex@test.com', 'role': 'STUDENT', 'first_name': 'Alex', 'last_name': 'Student'
    })
    student.role = 'STUDENT' # Ensure role
    student.set_password('pass123')
    student.save()
    
    # Institute
    inst = Institute.objects.first()
    if not inst:
        print("!! No Institute found. Run seed_essentials.py first. !!")
        return

    # Link Users to Institute
    for u in [admin_user, instructor, student]:
        u.institute = inst
        u.save()

    print(f"Users Ready: Admin={admin_user.username}, Instructor={instructor.username}, Student={student.username}")

    # --- 1. Admin Flow: Create Academic Structure ---
    print("\n[Step 1] Admin: Creating Academic Structure...")
    client.force_authenticate(user=admin_user)
    
    # Create Program
    prog_data = {'institute': inst.id, 'name': 'AI Masterclass', 'code': 'AIM-2026'}
    res = client.post('/api/programs/', prog_data)
    if res.status_code == 201:
        program_id = res.data['id']
        print(f"  ✓ Program Created: {res.data['name']} (ID: {program_id})")
    else:
        print(f"  X Failed to create program: {res.data}")
        return

    # Create Batch
    batch_data = {
        'program': program_id, 'name': 'Spring 2026', 
        'start_date': str(timezone.now().date()), 
        'end_date': str(timezone.now().date() + timedelta(days=90))
    }
    res = client.post('/api/batches/', batch_data)
    if res.status_code == 201:
        batch_id = res.data['id']
        print(f"  ✓ Batch Created: {res.data['name']} (ID: {batch_id})")
    else:
        print(f"  X Failed to create batch: {res.data}")
        return
        
    # Create Course
    course_data = {
        'batch': batch_id, 'title': 'Neural Networks', 'code': 'NN-101', 
        'instructor': instructor.id, 'description': 'Deep Learning Intro'
    }
    res = client.post('/api/courses/', course_data)
    if res.status_code == 201:
        course_id = res.data['id']
        print(f"  ✓ Course Created: {res.data['title']} (ID: {course_id})")
    else:
        print(f"  X Failed to create course: {res.data}")
        return

    # --- 2. Instructor Flow: Content & Assignments ---
    print("\n[Step 2] Instructor: Managing Content...")
    client.force_authenticate(user=instructor)
    
    # Check Dashboard
    res = client.get('/api/instructor/dashboard/')
    if res.status_code == 200:
        found = any(c['id'] == course_id for c in res.data['courses'])
        print(f"  ✓ Instructor Dashboard Access: {'Course Found' if found else 'Course Not Found'}")
    else:
        print(f"  X Dashboard Access Failed: {res.status_code}")

    # Create Module
    mod_data = {'course': course_id, 'title': 'Week 1: Perceptrons', 'order': 1}
    res = client.post('/api/modules/', mod_data)
    module_id = res.data['id'] if res.status_code == 201 else None

    # Create Lesson
    if module_id:
        les_data = {'module': module_id, 'title': 'Introduction Video', 'content_type': 'VIDEO', 'order': 1}
        res = client.post('/api/lessons/', les_data)
        if res.status_code == 201:
             print(f"  ✓ Content Added: Module & Lesson created.")
    
    # Create Assignment
    assign_data = {
        'course': course_id, 'title': 'Build a Perceptron', 
        'description': 'Code it in Python', 'total_marks': 100,
        'due_date': timezone.now() + timedelta(days=7)
    }
    res = client.post('/api/assignments/', assign_data)
    if res.status_code == 201:
        assignment_id = res.data['id']
        print(f"  ✓ Assignment Created: {res.data['title']} (ID: {assignment_id})")
    else:
        print(f"  X Failed to create assignment: {res.data}")
        return

    # Create Live Class
    live_data = {
        'batch': batch_id, 'instructor': instructor.id, 'topic': 'Q&A Session',
        'start_time': timezone.now() + timedelta(hours=2), 'duration_minutes': 60,
        'join_url': 'https://zoom.us/test'
    }
    res = client.post('/api/live-classes/', live_data)
    if res.status_code == 201:
        print(f"  ✓ Live Class Scheduled: {res.data['topic']}")

    # --- 3. Student Flow: Enroll & Participate ---
    print("\n[Step 3] Student: Dashboard & Participation...")
    # Admin enrolls student (using Admin auth again)
    client.force_authenticate(user=admin_user)
    enroll_data = {'student_id': student.id, 'batch_id': batch_id, 'active': True}
    res = client.post('/api/enrollments/', enroll_data)
    if res.status_code == 201:
        print(f"  ✓ Student Enrolled in Batch.")
    else:
        print(f"  X Enrollment Failed: {res.data}")

    # Switch to Student
    client.force_authenticate(user=student)
    
    # Check Dashboard
    res = client.get('/api/student/dashboard/')
    if res.status_code == 200:
        # Check active courses
        has_course = any(c['id'] == course_id for c in res.data['active_courses'])
        # Check live classes
        has_live = len(res.data['upcoming_live_classes']) > 0
        print(f"  ✓ Student Dashboard: Course Visible={'Yes' if has_course else 'No'}, Live Class Visible={'Yes' if has_live else 'No'}")
    
    # Submit Assignment
    sub_data = {'assignment': assignment_id, 'student': student.id, 'content': 'Here is my code...', 'status': 'SUBMITTED'}
    res = client.post('/api/submissions/', sub_data)
    if res.status_code == 201:
        submission_id = res.data['id']
        print(f"  ✓ Assignment Submitted successfully.")
    else:
        print(f"  X Submission Failed: {res.data}")
        submission_id = None

    # --- 4. Instructor Grading Flow ---
    if submission_id:
        print("\n[Step 4] Instructor: Grading...")
        client.force_authenticate(user=instructor)
        
        # Check Pending
        res = client.get('/api/instructor/dashboard/')
        pending_count = len(res.data.get('pending_grading', []))
        print(f"  ✓ Pending Grading Count: {pending_count}")
        
        # Grade it
        grade_data = {'score': 95, 'feedback': 'Excellent work!'}
        res = client.patch(f'/api/submissions/{submission_id}/grade/', grade_data)
        if res.status_code == 200:
            print(f"  ✓ Submission Graded: Score 95/100")
        else:
             print(f"  X Grading Failed: {res.data}")

    print("="*60)
    print("TEST SUITE COMPLETED")
    print("="*60)

if __name__ == '__main__':
    run_e2e_test()
