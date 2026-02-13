from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from .models import AlumniProfile, Employer, JobPosting, JobApplication, PlacementOutcome
from .serializers import (
    AlumniProfileSerializer, EmployerSerializer, JobPostingSerializer, 
    JobApplicationSerializer, PlacementOutcomeSerializer
)
from core.permissions import IsSuperAdmin, IsInstituteAdmin, IsStudent, IsAlumni, IsEmployer
from core.mixins import AuditLogMixin

class AlumniProfileViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = AlumniProfile.objects.all()
    serializer_class = AlumniProfileSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['skills', 'user__first_name', 'user__last_name', 'current_role']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'EMPLOYER':
            return AlumniProfile.objects.filter(institute=user.institute, is_public=True)
        elif user.role == 'ALUMNI':
            return AlumniProfile.objects.filter(user=user)
        return AlumniProfile.objects.filter(institute=user.institute)

class JobPostingViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = JobPosting.objects.filter(is_active=True)
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'EMPLOYER':
            return JobPosting.objects.filter(employer__user=user)
        return JobPosting.objects.filter(institute=user.institute, is_active=True)

    def perform_create(self, serializer):
        user = self.request.user
        
        # If Employer user
        if user.role == 'EMPLOYER':
            employer = Employer.objects.get(user=user)
            instance = serializer.save(employer=employer, institute=user.institute)
            self._log_action('CREATE', instance)
            return

        # If Admin, must assume they picked an employer
        if user.role in ['INSTITUTE_ADMIN', 'SUPER_ADMIN']:
             employer_id = self.request.data.get('employer')
             if not employer_id:
                  raise serializers.ValidationError({"employer": "Employer selection required for admin posting"})
             
             employer = Employer.objects.get(id=employer_id, institute=user.institute)
             instance = serializer.save(employer=employer, institute=user.institute)
             self._log_action('CREATE', instance)
             return

        raise permissions.PermissionDenied("You cannot post jobs.")

class JobApplicationViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ALUMNI':
            return JobApplication.objects.filter(alumni__user=user)
        elif user.role == 'EMPLOYER':
            return JobApplication.objects.filter(job__employer__user=user)
        return JobApplication.objects.filter(job__institute=user.institute)

    def perform_create(self, serializer):
        alumni = AlumniProfile.objects.get(user=self.request.user)
        instance = serializer.save(alumni=alumni)
        self._log_action('CREATE', instance)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if request.user.role != 'EMPLOYER' and request.user.role != 'INSTITUTE_ADMIN':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status:
            application.status = new_status
            application.save()
            return Response({'status': 'updated'})
        return Response({'error': 'status required'}, status=status.HTTP_400_BAD_REQUEST)

class EmployerViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Employer.objects.all()
    serializer_class = EmployerSerializer
    
    
    def get_queryset(self):
        return Employer.objects.filter(institute=self.request.user.institute)

    def perform_create(self, serializer):
        # Admin creating a directory entry
        serializer.save(institute=self.request.user.institute)

from academics.models import Enrollment
from academics.serializers import EnrollmentSerializer
from core.models import User

class GraduateStudentsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists students who have fully completed a course in the institute (Online/Offline)
    but are NOT yet in the Alumni directory.
    """
    serializer_class = EnrollmentSerializer # Or a custom simpler serializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.institute:
             return Enrollment.objects.none()
        
        # Criteria for "Graduate":
        # 1. Users who have a Certificate for this course? best proof of graduation.
        
        from academics.models import Certificate
        graduated_users = Certificate.objects.filter(
            status='ISSUED', 
            student__institute=user.institute
        ).values_list('student', flat=True)
        
        # Filter Enrollments for these students, EXCLUDE those who already have an AlumniProfile
        existing_alumni = AlumniProfile.objects.filter(institute=user.institute).values_list('user', flat=True)
        
        return Enrollment.objects.filter(
            student__in=graduated_users,
            student__institute=user.institute
        ).exclude(student__in=existing_alumni).distinct() # Might duplicate if multiple courses, distinct student?

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        enrollment = self.get_object()
        user = enrollment.student
        
        # Check if already alumni
        if hasattr(user, 'alumni_profile'):
             return Response({'message': 'User is already an Alumni'}, status=400)
             
        # Create Alumni Profile
        AlumniProfile.objects.create(
            user=user,
            institute=user.institute,
            graduation_date=enrollment.last_attendance_date or enrollment.enrolled_at.date() # Fallback
        )
        
        return Response({'status': 'Promoted to Alumni'})
