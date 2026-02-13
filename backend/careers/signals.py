from django.db.models.signals import post_save
from django.dispatch import receiver
from academics.models import Certificate
from .models import AlumniProfile
from core.models import User

@receiver(post_save, sender=Certificate)
def create_alumni_profile(sender, instance, created, **kwargs):
    if instance.status == 'ISSUED':
        # Create Alumni Profile
        profile, created_profile = AlumniProfile.objects.get_or_create(
            user=instance.student,
            defaults={
                'institute': instance.student.institute,
                'graduation_date': instance.issued_at.date()
            }
        )
        
        # Update role to ALUMNI if it was STUDENT
        if instance.student.role == User.Roles.STUDENT:
            instance.student.role = User.Roles.ALUMNI
            instance.student.save()
            print(f"User {instance.student.username} promoted to ALUMNI.")
