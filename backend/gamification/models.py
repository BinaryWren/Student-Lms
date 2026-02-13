from django.db import models
from core.models import User, Institute

class GamificationSettings(models.Model):
    institute = models.OneToOneField(Institute, on_delete=models.CASCADE, related_name='gamification_settings')
    enabled = models.BooleanField(default=True)
    
    # Points Configuration
    xp_per_login = models.PositiveIntegerField(default=10)
    xp_per_lesson = models.PositiveIntegerField(default=50)
    xp_per_assignment_submission = models.PositiveIntegerField(default=100)
    xp_per_assignment_score_perfect = models.PositiveIntegerField(default=50) # Bonus for 100%
    xp_per_quiz_attempt = models.PositiveIntegerField(default=20)
    xp_per_quiz_score_per_point = models.PositiveIntegerField(default=1) # e.g. 80% score = 80 XP
    xp_per_attendance = models.PositiveIntegerField(default=30)

    def __str__(self): return f"Gamification Settings for {self.institute.name}"

class Badge(models.Model):
    class CriteriaType(models.TextChoices):
        XP_THRESHOLD = 'XP', 'XP Threshold'
        LESSONS_COMPLETED = 'LESSONS', 'Lessons Completed'
        STREAK = 'STREAK', 'Daily Streak'
        MANUAL = 'MANUAL', 'Manual Award'

    name = models.CharField(max_length=255)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='trophy') # Lucid icon name
    criteria_type = models.CharField(max_length=20, choices=CriteriaType.choices, default=CriteriaType.XP_THRESHOLD)
    criteria_value = models.IntegerField(default=0)
    xp_bonus = models.PositiveIntegerField(default=0)
    
    # Global or Institute specific? Let's make badges global templates for now, 
    # but maybe linked to institute if custom. For MVP, global templates.
    institute = models.ForeignKey(Institute, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self): return self.name

class UserGamificationProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification_profile')
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    current_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def calculate_level(self):
        # Simple algorithm: Level = 1 + sqrt(XP / 100) or similar
        # Let's do logical steps: Level 1: 0-1000, Level 2: 1001-2500, etc.
        # Constant multiplier: Level = floor(total_xp / 1000) + 1
        return (self.total_xp // 1000) + 1

    def save(self, *args, **kwargs):
        self.level = self.calculate_level()
        super().save(*args, **kwargs)

    def __str__(self): return f"{self.user.username} - Lvl {self.level}"

class UserBadge(models.Model):
    profile = models.ForeignKey(UserGamificationProfile, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta: unique_together = ('profile', 'badge')
    def __str__(self): return f"{self.profile.user.username} - {self.badge.name}"

class XPRecord(models.Model):
    profile = models.ForeignKey(UserGamificationProfile, on_delete=models.CASCADE, related_name='xp_history')
    amount = models.IntegerField()
    source = models.CharField(max_length=255) # e.g. "Lesson: Intro to Python"
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"{self.profile.user.username} +{self.amount} ({self.source})"
