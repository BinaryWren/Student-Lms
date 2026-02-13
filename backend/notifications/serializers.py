from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['email_enabled', 'in_app_enabled', 'assignment_reminders', 'quiz_reminders', 'cert_availability', 'inactivity_warnings', 'quiet_hours_start', 'quiet_hours_end']
