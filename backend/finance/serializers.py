from rest_framework import serializers
from .models import FeeRecord, SalaryRecord, OtherTransaction
from core.models import User

class FeeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class Meta:
        model = FeeRecord
        fields = '__all__'

class SalaryRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    class Meta:
        model = SalaryRecord
        fields = '__all__'

class OtherTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherTransaction
        fields = '__all__'
