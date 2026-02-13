from rest_framework import serializers
from core.models import User
from django.db import transaction
from django.utils.crypto import get_random_string
from .models import EmployeeProfile, EmployeeTask, EmployeeAttendance, LeaveRequest

class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    class Meta:
        model = EmployeeAttendance
        fields = ['id', 'employee', 'employee_name', 'date', 'status', 'check_in', 'check_out', 'notes']

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee', 'employee_name', 'leave_type', 'start_date', 'end_date', 'reason', 'status', 'hr_comments', 'applied_on']
        read_only_fields = ['applied_on']

class EmployeeTaskSerializer(serializers.ModelSerializer):
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.get_full_name')
    class Meta:
        model = EmployeeTask
        fields = ['id', 'employee', 'title', 'description', 'status', 'due_date', 'created_at', 'assigned_by_name']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = ['designation', 'department', 'date_of_joining', 'phone_number', 'salary', 'address', 'monthly_leave_quota', 'remaining_leaves']

class EmployeeSerializer(serializers.ModelSerializer):
    profile = EmployeeProfileSerializer(source='employee_profile', read_only=True)
    tasks = EmployeeTaskSerializer(source='assigned_tasks', many=True, read_only=True)
    
    # Write fields for creating flat structure from frontend
    designation = serializers.CharField(write_only=True, required=False)
    department = serializers.CharField(write_only=True, required=False)
    date_of_joining = serializers.DateField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    salary = serializers.DecimalField(write_only=True, max_digits=10, decimal_places=2, required=False, allow_null=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    full_name = serializers.SerializerMethodField()
    role_type = serializers.ChoiceField(
        choices=[('HR', 'HR'), ('EMPLOYEE', 'Employee'), ('INSTRUCTOR', 'Instructor'), ('INSTITUTE_ADMIN', 'Institute Admin')], 
        write_only=True, 
        default='EMPLOYEE'
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'employee_id', 'role', 'full_name', 'profile', 'is_active', 'tasks',
            'designation', 'department', 'date_of_joining', 'phone_number', 'salary', 'address', 'role_type',
            'raw_password'
        ]
        read_only_fields = ['username', 'employee_id', 'role', 'raw_password']

    def get_full_name(self, obj):
        return obj.get_full_name()

    @transaction.atomic
    def create(self, validated_data):
        try:
            print("DEBUG: Creating Employee with data:", validated_data) 
            
            # Sanitize Salary
            salary_val = validated_data.pop('salary', None)
            if salary_val == '': salary_val = None
            
            role_type = validated_data.pop('role_type', 'EMPLOYEE')
            
            # Extract profile fields Safely (Profile fields are expected for CREATE)
            try:
                profile_data = {
                    'designation': validated_data.pop('designation'),
                    'department': validated_data.pop('department'),
                    'date_of_joining': validated_data.pop('date_of_joining'),
                    'phone_number': validated_data.pop('phone_number', ''),
                    'salary': salary_val,
                    'address': validated_data.pop('address', '')
                }
            except KeyError as e:
                # If fields are missing in create, it will fail here, which is fine since they are required for creation
                raise serializers.ValidationError({str(e).replace("'",""): "This field is required on creation."})


            password = get_random_string(length=10) 
            username_base = 'temp_emp_' + get_random_string(8) 
            
            user = User.objects.create_user(
                username=username_base,
                email=validated_data.get('email'),
                password=password,
                first_name=validated_data.get('first_name'),
                last_name=validated_data.get('last_name'),
                role=role_type,
                raw_password=password
            )
            
            EmployeeProfile.objects.create(user=user, **profile_data)
            return user
        except Exception as e:
            import traceback
            traceback.print_exc()
    @transaction.atomic
    def update(self, instance, validated_data):
        # Extract profile fields
        profile_data = {}
        for field in ['designation', 'department', 'date_of_joining', 'phone_number', 'salary', 'address']:
             if field in validated_data:
                 val = validated_data.pop(field)
                 if field == 'salary' and val == '': val = None
                 profile_data[field] = val
        
        role_type = validated_data.pop('role_type', None)
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if role_type:
            instance.role = role_type
            
        instance.save()
        
        # Update Profile fields
        if hasattr(instance, 'employee_profile'):
            profile = instance.employee_profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        else:
            # Create if missing (edge case)
            # Ensure required profile fields are present if creating new
            # For update, we might not have all, so we use defaults or fail? 
            # Ideally profile should exist. 
            pass 
            
        return instance
