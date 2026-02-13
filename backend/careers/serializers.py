from rest_framework import serializers
from .models import AlumniProfile, Employer, JobPosting, JobApplication, PlacementOutcome
from core.serializers import UserSerializer

class AlumniProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    full_name = serializers.ReadOnlyField(source='user.get_full_name')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = AlumniProfile
        fields = '__all__'

class EmployerSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Employer
        fields = '__all__'

class JobPostingSerializer(serializers.ModelSerializer):
    employer_name = serializers.ReadOnlyField(source='employer.company_name')
    employer_logo = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = '__all__'

    def get_employer_logo(self, obj):
        return None # Placeholder for employer logo if needed

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    company_name = serializers.ReadOnlyField(source='job.employer.company_name')
    alumni_name = serializers.ReadOnlyField(source='alumni.user.get_full_name')

    class Meta:
        model = JobApplication
        fields = '__all__'

class PlacementOutcomeSerializer(serializers.ModelSerializer):
    alumni_name = serializers.ReadOnlyField(source='alumni.user.get_full_name')
    
    class Meta:
        model = PlacementOutcome
        fields = '__all__'
