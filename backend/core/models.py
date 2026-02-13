from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class Organization(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Institute(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='institutes')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    theme_primary_color = models.CharField(max_length=20, default='oklch(0.55 0.25 265)')
    logo_url = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Roles(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        INSTITUTE_ADMIN = 'INSTITUTE_ADMIN', 'Institute Admin'
        HR = 'HR', 'HR'
        INSTRUCTOR = 'INSTRUCTOR', 'Instructor'
        EMPLOYEE = 'EMPLOYEE', 'Employee'
        STUDENT = 'STUDENT', 'Student'
        ALUMNI = 'ALUMNI', 'Alumni'
        EMPLOYER = 'EMPLOYER', 'Employer'

    class CourseMode(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)
    course_mode = models.CharField(max_length=10, choices=CourseMode.choices, default=CourseMode.OFFLINE, null=True, blank=True)
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    
    # Student specific credentials
    student_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    instructor_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    employee_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    raw_password = models.CharField(max_length=255, blank=True, null=True) # To allow admins to view credentials

    def __str__(self):
        return f"{self.username} ({self.role})"

class ZoomCredential(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='zoom_credentials')
    account_id = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self): return f"Zoom: {self.institute.name}"

class AuditLog(models.Model):
    ACTION_TYPES = [
        ('LOGIN', 'Login'),
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View Sensitive'),
    ]

    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=100)
    target_object_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class InstructorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    linkedin_url = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='instructor_profiles/', blank=True, null=True)
    cv_file = models.FileField(upload_to='instructor_cvs/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True) # Could be Rich Text or JSON later
    

import uuid

class InstructorInvitation(models.Model):
    email = models.EmailField()
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite: {self.email} ({self.institute.name})"


