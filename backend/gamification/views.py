from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from .models import UserGamificationProfile, Badge, UserBadge, XPRecord, GamificationSettings
from .serializers import UserGamificationProfileSerializer, BadgeSerializer, LeaderboardEntrySerializer
from core.models import User
from academics.models import Enrollment

class GamificationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        # Return current user's profile
        profile, _ = UserGamificationProfile.objects.get_or_create(user=request.user)
        serializer = UserGamificationProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        user = request.user
        
        # Determine scope: Batch or Institute?
        # User requested: "Leaderboards are batch-specific"
        
        if user.role == 'STUDENT':
            # Get primary batch (active enrollment)
            enrollment = Enrollment.objects.filter(student=user, active=True).first()
            if not enrollment:
                return Response({'error': 'No active enrollment found'}, status=400)
            batch = enrollment.batch
            
            # Get all students in this batch
            student_ids = Enrollment.objects.filter(batch=batch, active=True).values_list('student_id', flat=True)
            
            profiles = UserGamificationProfile.objects.filter(user__id__in=student_ids).order_by('-total_xp')
        
        elif user.role == 'INSTRUCTOR':
             # Maybe show institute wide top students? Or specific course?
             # Let's show Institute Top 10 for now
             if not user.institute: return Response([])
             profiles = UserGamificationProfile.objects.filter(user__institute=user.institute, user__role='STUDENT').order_by('-total_xp')
        else:
             return Response([])

        # Limit to top 20
        profiles = profiles[:20]
        
        data = []
        for idx, p in enumerate(profiles):
            data.append({
                'rank': idx + 1,
                'user_id': p.user.id,
                'name': p.user.get_full_name(),
                'total_xp': p.total_xp,
                'level': p.level,
                'badges_count': p.badges.count()
            })
            
        return Response(data)

    @action(detail=False, methods=['get'])
    def badges(self, request):
        # List all available badges vs earned badges
        # For now, just return earned
        profile, _ = UserGamificationProfile.objects.get_or_create(user=request.user)
        earned_ids = UserBadge.objects.filter(profile=profile).values_list('badge_id', flat=True)
        
        all_badges = Badge.objects.filter(Q(institute__isnull=True) | Q(institute=request.user.institute))
        
        data = []
        for b in all_badges:
            data.append({
                'id': b.id,
                'name': b.name,
                'description': b.description,
                'icon': b.icon_name,
                'earned': b.id in earned_ids,
                'xp_bonus': b.xp_bonus
            })
            
        return Response(data)
