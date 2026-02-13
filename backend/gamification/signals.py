from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from core.models import User
from academics.models import LessonProgress, Submission, QuizAttempt, Attendance
from .models import UserGamificationProfile, GamificationSettings, XPRecord, Badge, UserBadge
from datetime import timedelta

def get_or_create_profile(user):
    profile, created = UserGamificationProfile.objects.get_or_create(user=user)
    return profile

def get_settings(user):
    if not user.institute: return None
    settings, created = GamificationSettings.objects.get_or_create(institute=user.institute)
    if not settings.enabled: return None
    return settings

def award_xp(user, amount, source):
    if amount <= 0: return
    settings = get_settings(user)
    if not settings: return

    profile = get_or_create_profile(user)
    profile.total_xp += amount
    profile.save()

    XPRecord.objects.create(profile=profile, amount=amount, source=source)
    check_badges(user, profile)

def check_badges(user, profile):
    # Simple check for XP thresholds
    # We could optimize this by not checking every time, but for MVP it's safer.
    badges = Badge.objects.filter(institute__in=[None, user.institute])
    
    for badge in badges:
        # Skip if already owned
        if UserBadge.objects.filter(profile=profile, badge=badge).exists():
            continue

        awarded = False
        if badge.criteria_type == 'XP':
            if profile.total_xp >= badge.criteria_value:
                awarded = True
        elif badge.criteria_type == 'LESSONS':
            # Count lessons
            count = LessonProgress.objects.filter(student=user, is_completed=True).count()
            if count >= badge.criteria_value:
                awarded = True
        
        if awarded:
            UserBadge.objects.create(profile=profile, badge=badge)
            # Award Bonus XP?
            if badge.xp_bonus > 0:
                award_xp(user, badge.xp_bonus, f"Badge Bonus: {badge.name}")


# --- Signal Handlers ---

@receiver(post_save, sender=LessonProgress)
def xp_on_lesson_complete(sender, instance, created, **kwargs):
    if instance.is_completed: # Usually created=True or updated
        # Avoid double awarding: check if XP record exists for this? 
        # For simplicity, we assume 'complete' happens once. 
        # But if user toggles, we might spam.
        # Let's check history.
        source_id = f"Lesson:{instance.lesson.id}"
        profile = get_or_create_profile(instance.student)
        if XPRecord.objects.filter(profile=profile, source=source_id).exists():
            return
        
        settings = get_settings(instance.student)
        if settings:
            award_xp(instance.student, settings.xp_per_lesson, source_id)

@receiver(post_save, sender=Submission)
def xp_on_submission(sender, instance, created, **kwargs):
    # Award on creation (Submission)
    # Re-award on Grading?
    # Let's award regular XP on submission
    if created:
        source_id = f"Assignment:{instance.assignment.id}"
        profile = get_or_create_profile(instance.student)
        if XPRecord.objects.filter(profile=profile, source=source_id).exists():
            return
        
        settings = get_settings(instance.student)
        if settings:
            award_xp(instance.student, settings.xp_per_assignment_submission, source_id)

    # Award on Grading (Perfect Score)
    if instance.grade is not None:
        # Check if perfect
        if instance.grade >= 100: # Assuming 100 scale or check rubric total
             source_id = f"AssignmentPerf:{instance.assignment.id}"
             profile = get_or_create_profile(instance.student)
             if XPRecord.objects.filter(profile=profile, source=source_id).exists():
                return
             settings = get_settings(instance.student)
             if settings:
                 award_xp(instance.student, settings.xp_per_assignment_score_perfect, source_id)

@receiver(post_save, sender=QuizAttempt)
def xp_on_quiz_attempt(sender, instance, created, **kwargs):
    if instance.completed_at and instance.score is not None:
         # Only award once per attempt
         source_id = f"QuizAttempt:{instance.id}"
         profile = get_or_create_profile(instance.student)
         if XPRecord.objects.filter(profile=profile, source=source_id).exists():
            return
        
         settings = get_settings(instance.student)
         if settings:
             # Base XP + Score XP
             total = settings.xp_per_quiz_attempt + int(instance.score * settings.xp_per_quiz_score_per_point)
             award_xp(instance.student, total, source_id)

@receiver(post_save, sender=Attendance)
def xp_on_attendance(sender, instance, created, **kwargs):
    if instance.status == 'PRESENT':
         source_id = f"Attendance:{instance.live_class.id}"
         profile = get_or_create_profile(instance.student)
         if XPRecord.objects.filter(profile=profile, source=source_id).exists():
            return
         
         settings = get_settings(instance.student)
         if settings:
             award_xp(instance.student, settings.xp_per_attendance, source_id)
