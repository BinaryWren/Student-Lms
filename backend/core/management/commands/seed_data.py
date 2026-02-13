from django.core.management.base import BaseCommand
from core.models import User, Institute, Organization
from academics.models import (
    Program, Batch, Course, Module, Lesson, Enrollment, LessonResource, Announcement,
    Assignment, QuestionBank, Question, Quiz, LiveClass
)
from datetime import date, timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds database with initial institute data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")
        
        # ... (Existing Seeding)
        org, _ = Organization.objects.get_or_create(name="Global EdTech Corp")
        ecs, _ = Institute.objects.get_or_create(organization=org, name="ECS", defaults={'theme_primary_color': 'oklch(0.55 0.25 265)'})
        
        # Users
        ecs_admin, _ = User.objects.get_or_create(username='ecs_admin', defaults={'email':'admin@ecs.com', 'role':'INSTITUTE_ADMIN', 'institute':ecs, 'first_name': 'Admin', 'last_name': 'User'})
        if not ecs_admin.check_password('pass123'): ecs_admin.set_password('pass123'); ecs_admin.save()

        jane_instructor, _ = User.objects.get_or_create(username='instructor_jane', defaults={'email':'jane@ecs.com', 'role':'INSTRUCTOR', 'institute':ecs, 'first_name': 'Jane', 'last_name': 'Doe'})
        if not jane_instructor.check_password('pass123'): jane_instructor.set_password('pass123'); jane_instructor.save()

        alex_student, _ = User.objects.get_or_create(username='alex_student', defaults={'email':'alex@example.com', 'role':'STUDENT', 'institute':ecs, 'first_name': 'Alex', 'last_name': 'Smith'})
        if not alex_student.check_password('pass123'): alex_student.set_password('pass123'); alex_student.save()

        # Academics
        prog_cse, _ = Program.objects.get_or_create(institute=ecs, name="Computer Science Engineering", code="CSE")
        batch_24, _ = Batch.objects.get_or_create(program=prog_cse, name="2024-2028", defaults={'start_date': date(2024, 8, 1), 'end_date': date(2028, 5, 30)})
        course_web, _ = Course.objects.get_or_create(batch=batch_24, title="Modern Web Development", code="CS101", defaults={'instructor': jane_instructor})
        
        # Enrollment
        Enrollment.objects.get_or_create(student=alex_student, batch=batch_24)

        # Content
        m1, _ = Module.objects.get_or_create(course=course_web, title="Phase 1: Foundations", order=1)
        Lesson.objects.get_or_create(module=m1, title="Introduction to React", order=1, content_type='VIDEO', content_url="https://www.youtube.com/embed/SqcY0GlETPk")
        
        # Assessment
        assign_1, _ = Assignment.objects.get_or_create(
            course=course_web, 
            title="React Basics Project", 
            defaults={
                'description': 'Build a simple counter app.', 
                'due_date': timezone.now() + timedelta(days=7)
            }
        )

        # --- LIVE CLASS ---
        LiveClass.objects.get_or_create(
            batch=batch_24,
            course=course_web,
            topic="React Live Doubt Session",
            defaults={
                'start_time': timezone.now() + timedelta(days=1, hours=2),
                'duration_minutes': 60,
                'instructor': jane_instructor,
                'join_url': 'https://zoom.us/j/999888777',
                'zoom_meeting_id': '999888777'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
