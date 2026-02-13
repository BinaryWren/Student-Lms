from rest_framework import serializers
from .models import User, Institute, Organization, ZoomCredential, InstructorProfile
from django.db import transaction
import random
import string
from django.utils import timezone

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = '__all__'
        extra_kwargs = {
            'organization': {'read_only': True},
            'slug': {'read_only': True}
        }

class InstructorProfileSerializer(serializers.ModelSerializer):
    # Using URLField/ImageField/FileField directly
    class Meta:
        model = InstructorProfile
        fields = ['linkedin_url', 'website_url', 'profile_picture', 'cv_file', 'address', 'experience']

class UserSerializer(serializers.ModelSerializer):
    profile = InstructorProfileSerializer(source='instructor_profile', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'institute', 'password', 'student_id', 'instructor_id', 'raw_password', 'profile', 'course_mode']
        extra_kwargs = {
            'password': {'write_only': True},
            'raw_password': {'read_only': True},
            'instructor_id': {'read_only': True}, # Auto-generated
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('instructor_profile', None)
        password = validated_data.pop('password', None)
        
        with transaction.atomic():
            user = User(**validated_data)
            
            # Auto-generate Instructor ID
            if user.role == 'INSTRUCTOR' and not user.instructor_id:
                inst_code = user.institute.name[:3].upper() if user.institute else "INS"
                year = timezone.now().year
                
                while True:
                    random_num = ''.join(random.choices(string.digits, k=4))
                    new_id = f"INS-{inst_code}-{year}-{random_num}"
                    if not User.objects.filter(instructor_id=new_id).exists() and not User.objects.filter(username=new_id).exists():
                        user.instructor_id = new_id
                        user.username = new_id
                        break

            # Auto-generate Student ID and Credentials
            if user.role == 'STUDENT' and not user.student_id:
                inst_code = user.institute.name[:3].upper() if user.institute else "STU"
                year = timezone.now().year
                random_num = ''.join(random.choices(string.digits, k=4))
                
                if user.course_mode == 'ONLINE':
                    prefix = f"ONL-{inst_code}"
                    student_id = f"{prefix}-{year}-{random_num}"
                    while User.objects.filter(student_id=student_id).exists():
                        random_num = ''.join(random.choices(string.digits, k=4))
                        student_id = f"{prefix}-{year}-{random_num}"
                    
                    user.student_id = student_id
                    # Online students use email as username if provided, else keep username
                    if user.email:
                        user.username = user.email
                else:
                    student_id = f"{inst_code}-{year}-{random_num}"
                    while User.objects.filter(student_id=student_id).exists():
                        random_num = ''.join(random.choices(string.digits, k=4))
                        student_id = f"{inst_code}-{year}-{random_num}"
                    
                    user.student_id = student_id
                    user.username = student_id # Offline students use ID as username

            # Auto-generate password if missing for students/instructors
            if not password and user.role in ['STUDENT', 'INSTRUCTOR']:
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            
            if password:
                user.set_password(password)
                user.raw_password = password 
            user.save()

            if profile_data:
                InstructorProfile.objects.create(user=user, **profile_data)
        
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('instructor_profile', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            instance.raw_password = password
            
        instance.save()
        
        if profile_data and instance.role == 'INSTRUCTOR':
             profile, created = InstructorProfile.objects.get_or_create(user=instance)
             for attr, value in profile_data.items():
                 setattr(profile, attr, value)
             profile.save()
             
        return instance

class ZoomCredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoomCredential
        fields = ['id', 'account_id', 'client_id', 'client_secret', 'is_active']
        extra_kwargs = {'client_secret': {'write_only': True}}
