from rest_framework import viewsets, permissions
from academics.views import BaseInstituteViewSet
from core.permissions import IsHROrAdmin
from .models import FeeRecord, SalaryRecord, OtherTransaction
from .serializers import FeeRecordSerializer, SalaryRecordSerializer, OtherTransactionSerializer

class FeeRecordViewSet(BaseInstituteViewSet):
    queryset = FeeRecord.objects.all()
    serializer_class = FeeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHROrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        # Students only see their own
        if user.role == 'STUDENT':
            return qs.filter(student=user)
        
        # HR/Admin can filter by student_id
        student_id = self.request.query_params.get('student_id')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

class SalaryRecordViewSet(BaseInstituteViewSet):
    queryset = SalaryRecord.objects.all()
    serializer_class = SalaryRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHROrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        # Employees only see their own
        if user.role in ['EMPLOYEE', 'INSTRUCTOR']:
            return qs.filter(employee=user)
            
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        return qs

class OtherTransactionViewSet(BaseInstituteViewSet):
    queryset = OtherTransaction.objects.all()
    serializer_class = OtherTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHROrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        # Only HR/Admin should see global list, but for now we follow BaseInstituteViewSet filtering
        return super().get_queryset()
