from django.db import models
from django.conf import settings
from core.models import Institute, User

class AlumniProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alumni_profile')
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='alumni_profiles')
    graduation_date = models.DateField(null=True, blank=True)
    skills = models.JSONField(default=list, blank=True) # or a Tag model
    portfolio_url = models.URLField(blank=True, null=True)
    current_company = models.CharField(max_length=255, blank=True, null=True)
    current_role = models.CharField(max_length=255, blank=True, null=True)
    employment_status = models.CharField(max_length=20, choices=[('EMPLOYED', 'Employed'), ('UNEMPLOYED', 'Unemployed')], default='UNEMPLOYED')
    bio = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True) # Can employers see?
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Alumni"

class Employer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employer_profile', null=True, blank=True)
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='employers')
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

class JobPosting(models.Model):
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='jobs')
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50, choices=[
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('INTERNSHIP', 'Internship'),
        ('CONTRACT', 'Contract'),
    ])
    requirements = models.TextField(blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('APPLIED', 'Applied'),
        ('SCREENING', 'Screening'),
        ('INTERVIEW', 'Interview'),
        ('OFFERED', 'Offered'),
        ('REJECTED', 'Rejected'),
        ('ACCEPTED', 'Accepted'),
    ]

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    alumni = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name='applications')
    resume_url = models.URLField(blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'alumni')

    def __str__(self):
        return f"{self.alumni.user.username} for {self.job.title}"

class PlacementOutcome(models.Model):
    alumni = models.OneToOneField(AlumniProfile, on_delete=models.CASCADE, related_name='placement_outcome')
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True)
    company_name = models.CharField(max_length=255)
    role_title = models.CharField(max_length=255)
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    placement_date = models.DateField()
    is_campus_placement = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.alumni.user.username} placed at {self.company_name}"
