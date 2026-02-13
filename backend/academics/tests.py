from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from core.models import User, Institute, Organization
from academics.models import Program, Batch, Course, Assignment, Submission, GradeChangeRequest
from notifications.models import Notification

class GradeWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Organization & Institute
        self.org = Organization.objects.create(name="Test Org")
        self.institute = Institute.objects.create(organization=self.org, name="Test Institute")
        
        # Users
        self.admin = User.objects.create_user(username="admin", password="password", role='INSTITUTE_ADMIN', institute=self.institute)
        self.instructor = User.objects.create_user(username="instructor", password="password", role='INSTRUCTOR', institute=self.institute)
        self.student = User.objects.create_user(username="student", password="password", role='STUDENT', institute=self.institute)
        
        # Hierarchy
        self.program = Program.objects.create(institute=self.institute, name="CS", code="CS101")
        self.batch = Batch.objects.create(program=self.program, name="2024", start_date="2024-01-01", end_date="2024-12-31")
        self.course = Course.objects.create(batch=self.batch, title="Intro to CS", code="CS101", instructor=self.instructor)
        
        # Assignment
        self.assignment = Assignment.objects.create(
            course=self.course,
            title="Test Assignment",
            description="Test Desc",
            due_date=timezone.now(),
            total_points=100
        )
        self.submission = Submission.objects.create(
            assignment=self.assignment,
            student=self.student,
            file="submission.pdf"
        )
        
    def test_grade_locking_workflow(self):
        # 1. Initial Grading
        self.client.force_authenticate(user=self.instructor)
        url_grade = f"/api/submissions/{self.submission.id}/grade/"
        data = {'grade': 80, 'feedback': 'Good'}
        
        # Use format='json' to ensure numbers are passed as numbers
        response = self.client.post(url_grade, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.grade, 80)
        
        # 2. Attempt to Grade Again (Should Fail)
        response = self.client.post(url_grade, {'grade': 90}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('code'), 'GRADE_LOCKED')
        
        # 3. Create Change Request
        url_requests = "/api/grade-change-requests/"
        data_req = {
            'submission': self.submission.id,
            'new_grade': 95,
            'reason': 'Typo'
        }
        response = self.client.post(url_requests, data_req, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data['id']
        
        # Verify Admin Notification
        self.assertTrue(Notification.objects.filter(user=self.admin, title="New Grade Change Request").exists())
        
        # 4. Admin Approve
        self.client.force_authenticate(user=self.admin)
        url_approve = f"/api/grade-change-requests/{request_id}/approve/"
        response = self.client.post(url_approve, {'comment': 'Approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.grade, 95)
        
        # Verify Instructor Notification
        self.assertTrue(Notification.objects.filter(user=self.instructor, title="Grade Change Approved").exists())
        
    def test_reject_workflow(self):
        # Setup graded submission
        self.submission.grade = 80
        self.submission.save()
        
        # Create Request
        req = GradeChangeRequest.objects.create(
            submission=self.submission,
            requested_by=self.instructor,
            new_grade=100,
            reason="Bonus"
        )
        
        # Check permissions/visibility
        # Verify admin can see it
        # self.client.force_authenticate(user=self.admin)
        # res = self.client.get(f"/api/grade-change-requests/{req.id}/")
        
        # Admin Reject
        self.client.force_authenticate(user=self.admin)
        url_reject = f"/api/grade-change-requests/{req.id}/reject/"
        
        response = self.client.post(url_reject, {'comment': 'No bonus'}, format='json')
        
        if response.status_code != 200:
            print(f"DEBUG: Reject failed with {response.status_code}. Data: {response.data}")
            # Check queryset availability
            # existing = GradeChangeRequest.objects.filter(submission__student__institute=self.admin.institute)
            # print(f"DEBUG: Admin Institute: {self.admin.institute}, Visible Request Count: {existing.count()}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        req.refresh_from_db()
        self.assertEqual(req.status, 'REJECTED')
        
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.grade, 80) # Unchanged
        
        # Verify Warning Notification
        self.assertTrue(Notification.objects.filter(user=self.instructor, title="Grade Change Rejected").exists())
