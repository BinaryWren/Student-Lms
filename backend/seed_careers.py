import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Institute
from careers.models import Employer, JobPosting, AlumniProfile
from academics.models import Certificate, Course
from django.utils import timezone

# 1. Ensure Employer User
employer_user, created = User.objects.get_or_create(
    username='tech_employer',
    defaults={
        'first_name': 'Tech',
        'last_name': 'Hiring',
        'email': 'hire@tech.com',
        'role': 'EMPLOYER'
    }
)
if created:
    employer_user.set_password('pass123')
    employer_user.save()

# Get Institute
inst = Institute.objects.first()
employer_user.institute = inst
employer_user.save()

# 2. Create Employer Profile
employer, _ = Employer.objects.get_or_create(
    user=employer_user,
    defaults={
        'institute': inst,
        'company_name': 'Generic Tech Solutions',
        'website': 'https://tech.com',
        'is_verified': True
    }
)

# 3. Create Job Posting
job, _ = JobPosting.objects.get_or_create(
    employer=employer,
    title='Junior Web Developer',
    defaults={
        'institute': inst,
        'description': 'Looking for a junior developer specializing in Python and React.',
        'location': 'Remote',
        'job_type': 'FULL_TIME',
        'requirements': 'Bachelor degree in CS or equivalent experience.',
        'salary_range': '$40k - $60k'
    }
)

# 4. Mock Alumni Creation via Certificate
student = User.objects.filter(username='alex_student').first()
if student:
    course = Course.objects.first()
    cert, cert_created = Certificate.objects.get_or_create(
        student=student,
        course=course,
        defaults={
            'status': 'REVOKED' # Set to revoked first to trigger signal on update
        }
    )
    
    # Trigger signal by issuing
    cert.status = 'ISSUED'
    cert.save()
    print(f"Issued certificate for {student.username}. Alumni profile should be created.")

print("Seed Data Created.")
