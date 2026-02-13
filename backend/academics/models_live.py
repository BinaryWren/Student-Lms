from django.db import models
from core.models import Institute, User
from academics.models import Batch, Course

class ZoomCredential(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='zoom_credentials')
    account_id = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self): return f"Zoom: {self.institute.name}"

class LiveClass(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='live_classes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='live_classes')
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='hosted_classes')
    topic = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    
    # Zoom specific
    zoom_meeting_id = models.CharField(max_length=100, blank=True)
    join_url = models.URLField(max_length=1000, blank=True)
    start_url = models.URLField(max_length=1000, blank=True) # For host
    password = models.CharField(max_length=50, blank=True)
    
    # Post-class
    recording_url = models.URLField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self): return f"{self.topic} ({self.start_time})"

class Attendance(models.Model):
    live_class = models.ForeignKey(LiveClass, on_delete=models.CASCADE, related_name='attendance')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    joined_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent')], default='ABSENT')

    class Meta: unique_together = ('live_class', 'student')
