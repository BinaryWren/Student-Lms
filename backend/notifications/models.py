from django.db import models
from core.models import User

class Notification(models.Model):
    class Type(models.TextChoices):
        INFO = 'INFO', 'Information'
        WARNING = 'WARNING', 'Warning'
        SUCCESS = 'SUCCESS', 'Success'
        ERROR = 'ERROR', 'Error'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=Type.choices, default=Type.INFO)
    link = models.CharField(max_length=500, blank=True, null=True) # Action link
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    email_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    
    # Categories
    assignment_reminders = models.BooleanField(default=True)
    quiz_reminders = models.BooleanField(default=True)
    cert_availability = models.BooleanField(default=True)
    inactivity_warnings = models.BooleanField(default=True)
    
    # Quiet Hours (Simple 24h format e.g., 22 for 10PM, 8 for 8AM. UTC based or explicit?)
    # Keeping it simple: If current hour is between Start and End, don't send non-urgent emails.
    quiet_hours_start = models.PositiveIntegerField(null=True, blank=True, help_text="Start hour (0-23)")
    quiet_hours_end = models.PositiveIntegerField(null=True, blank=True, help_text="End hour (0-23)")

    def __str__(self):
        return f"Prefs: {self.user.username}"
