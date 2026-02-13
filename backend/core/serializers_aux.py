from rest_framework import serializers
from .models import LiveClass, Attendance
from core.models import ZoomCredential

class ZoomCredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoomCredential
        fields = ['id', 'account_id', 'client_id', 'client_secret', 'is_active']
        extra_kwargs = {'client_secret': {'write_only': True}} # Protect secret

class LiveClassSerializer(serializers.ModelSerializer):
    batch_name = serializers.ReadOnlyField(source='batch.name')
    instructor_name = serializers.ReadOnlyField(source='instructor.get_full_name')

    class Meta:
        model = LiveClass
        fields = '__all__'
        read_only_fields = ['join_url', 'start_url', 'password'] # These come from Zoom API

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class Meta:
        model = Attendance
        fields = '__all__'
