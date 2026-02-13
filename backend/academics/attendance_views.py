from .models import Enrollment, DailyAttendance, AttendanceApplication, Course
from .serializers import DailyAttendanceSerializer, AttendanceApplicationSerializer
from core.permissions import BaseInstituteViewSet
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date
import datetime

class DailyAttendanceViewSet(BaseInstituteViewSet):
    queryset = DailyAttendance.objects.all()
    serializer_class = DailyAttendanceSerializer
    filterset_fields = ['course', 'student', 'date', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'STUDENT':
            return qs.filter(student=user)
        # Instructors/Admins handled by BaseInstituteViewSet/Institute Filtering
        return qs

    @action(detail=False, methods=['post'])
    def mark(self, request):
        user = request.user
        course_id = request.data.get('course')
        
        if not course_id:
            return Response({'error': 'Course ID is required'}, status=400)
            
        try:
            course = Course.objects.get(id=course_id)
            # Find Enrollment using the course's batch
            if not course.batch:
                 return Response({'error': 'Course has no batch'}, status=400)
            
            enrollment = Enrollment.objects.get(student=user, batch=course.batch)
        except (Course.DoesNotExist, Enrollment.DoesNotExist):
            return Response({'error': 'Not enrolled in this course'}, status=404)

        if enrollment.status != Enrollment.Status.ACTIVE:
             return Response({
                 'error': 'Your account is inactive for this course due to absence.',
                 'code': 'INACTIVE_ACCOUNT'
             }, status=403)

        today = date.today()
        
        # Check consecutive absence logic
        # We need to find the last attendance date before today
        last_date = enrollment.last_attendance_date
        
        # If trying to mark today, and already marked? Only one per day.
        if DailyAttendance.objects.filter(student=user, course=course, date=today).exists():
            return Response({'message': 'Already marked for today', 'status': 'ALREADY_MARKED'})

        if last_date:
            gap = (today - last_date).days
            # If gap is 4 days or more. e.g. Last = 1st, Today = 5th. Gap = 4. 
            # Means absent on 2nd, 3rd, 4th. 3 days absent. 
            # Prompt says "absent 4 days or more". This usually means missed 4 consecutive sessions.
            # If we assume every day is a session:
            # Last attended: Jan 1. Today: Jan 6. Gap = 5 days. Absent: Jan 2,3,4,5 (4 days). -> Inactive.
            if gap > 4: 
                enrollment.status = Enrollment.Status.INACTIVE
                enrollment.save()
                return Response({
                    'error': 'You have been absent for 4 days or more. Your dashboard is inactive.',
                    'code': 'INACTIVE_ACCOUNT'
                }, status=403)
        
        # Valid to mark
        DailyAttendance.objects.create(student=user, course=course, status='PRESENT')
        enrollment.last_attendance_date = today
        enrollment.save()
        
        return Response({'status': 'MARKED'})


class AttendanceApplicationViewSet(BaseInstituteViewSet):
    queryset = AttendanceApplication.objects.all()
    serializer_class = AttendanceApplicationSerializer
    filterset_fields = ['course', 'student', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'STUDENT':
            return qs.filter(student=user)
        if user.role == 'INSTRUCTOR':
             return qs.filter(course__instructor=user)
        return qs # Admins see all filtered by institute via BaseInstituteViewSet

    def perform_create(self, serializer):
        # Ensure enrollment exists and is inactive to avoid spam? 
        # Or just allow creating.
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def forward_to_admin(self, request, pk=None):
        app = self.get_object()
        if request.user != app.course.instructor and request.user.role != 'INSTITUTE_ADMIN':
             return Response({'error': 'Permission denied'}, status=403)
        
        app.status = AttendanceApplication.Status.PENDING_ADMIN
        app.instructor_comment = request.data.get('comment', '')
        app.save()
        return Response(AttendanceApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role not in ['INSTITUTE_ADMIN', 'SUPER_ADMIN']:
             return Response({'error': 'Permission denied'}, status=403)
             
        app = self.get_object()
        app.status = AttendanceApplication.Status.APPROVED
        app.admin_comment = request.data.get('comment', '')
        app.save()
        
        # Re-activate Enrollment
        try:
            enrollment = Enrollment.objects.get(student=app.student, batch=app.course.batch)
            enrollment.status = Enrollment.Status.ACTIVE
            # Reset last attendance to today to prevent immediate re-lock?
            enrollment.last_attendance_date = date.today()
            enrollment.save()
        except Enrollment.DoesNotExist:
            pass # Should not happen
            
        return Response(AttendanceApplicationSerializer(app).data)
        
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['INSTITUTE_ADMIN', 'SUPER_ADMIN']:
             return Response({'error': 'Permission denied'}, status=403)
             
        app = self.get_object()
        app.status = AttendanceApplication.Status.REJECTED
        app.admin_comment = request.data.get('comment', '')
        app.save()
        return Response(AttendanceApplicationSerializer(app).data)
