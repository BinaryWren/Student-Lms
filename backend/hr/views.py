from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import User, Institute
from core.permissions import IsHROrAdmin
from academics.views import BaseInstituteViewSet
from django.utils.crypto import get_random_string
from .models import EmployeeProfile, EmployeeTask, EmployeeAttendance, LeaveRequest
from .serializers import (
    EmployeeSerializer, EmployeeTaskSerializer, 
    EmployeeAttendanceSerializer, LeaveRequestSerializer
)

class EmployeeViewSet(BaseInstituteViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsHROrAdmin]

    def get_queryset(self):
        user = self.request.user
        # Base query for employees, HRs, Instructors and Admins
        qs = User.objects.filter(role__in=['EMPLOYEE', 'HR', 'INSTRUCTOR', 'INSTITUTE_ADMIN']).select_related('employee_profile').order_by('-date_joined')

        if user.institute:
            return qs.filter(institute=user.institute)
        
        # Fallback for Super Admin / Users without institute
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            inst_id = self.request.query_params.get('institute_id')
            if inst_id:
                return qs.filter(institute_id=inst_id)
            # If no institute_id provided, maybe return all? Or none. Strict is better.
            return User.objects.none()
        
        return User.objects.none()

    def perform_create(self, serializer):
        try:
            # Allow serializer to create User and Profile
            user = serializer.save()
            
            # Post-creation logic: Set Institute, Generate proper ID, Finalize
            institute = self.request.user.institute
            
            # Allow manual institute assignment for admins
            if not institute and (self.request.user.is_superuser or self.request.user.role == 'SUPER_ADMIN'):
                inst_id = self.request.data.get('institute_id')
                if inst_id:
                     try:
                        institute = Institute.objects.get(pk=inst_id)
                     except Institute.DoesNotExist:
                        print(f"Institute {inst_id} not found")

            if not institute:
                print("WARNING: Creating employee without Institute linkage. User might not appear in lists.")
                return

            user.institute = institute
            
            # Generate ID: EMP-{INST_ID}-{RANDOM}
            code = get_random_string(4).upper()
            emp_id = f"EMP-{institute.id}-{code}"
            
            user.employee_id = emp_id
            user.username = emp_id 
            
            user.save()
        except Exception as e:
            import traceback
            with open("hr_view_error.log", "w") as f:
                f.write(str(e) + "\n" + traceback.format_exc())
            raise e

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'employee deactivated'})

class EmployeeTaskViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeTaskSerializer
    permission_classes = [IsHROrAdmin]
    queryset = EmployeeTask.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = EmployeeTask.objects.all().select_related('employee', 'assigned_by')
        if user.institute:
            return qs.filter(employee__institute=user.institute)
        return qs

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAttendance.objects.all()
    serializer_class = EmployeeAttendanceSerializer
    permission_classes = [IsHROrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().select_related('employee')
        if user.role in ['HR', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']:
            if user.institute:
                return qs.filter(employee__institute=user.institute)
            return qs
        return qs.filter(employee=user)

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().select_related('employee')
        if user.role in ['HR', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']:
            if user.institute:
                return qs.filter(employee__institute=user.institute)
            return qs
        return qs.filter(employee=user)

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsHROrAdmin])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'PENDING':
            return Response({'error': 'Already processed'}, status=400)
            
        leave.status = 'APPROVED'
        leave.hr_comments = request.data.get('comments', '')
        leave.save()
        
        # Deduct balance
        delta = (leave.end_date - leave.start_date).days + 1
        if hasattr(leave.employee, 'employee_profile'):
            profile = leave.employee.employee_profile
            profile.remaining_leaves = float(profile.remaining_leaves) - float(delta)
            profile.save()
            
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsHROrAdmin])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'REJECTED'
        leave.hr_comments = request.data.get('comments', '')
        leave.save()
        return Response({'status': 'rejected'})
