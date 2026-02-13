from rest_framework import serializers
from .models import UserGamificationProfile, Badge, UserBadge, XPRecord, GamificationSettings
from core.serializers import UserSerializer

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'awarded_at']

class XPRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = XPRecord
        fields = '__all__'

class UserGamificationProfileSerializer(serializers.ModelSerializer):
    badges = UserBadgeSerializer(many=True, read_only=True)
    recent_activity = serializers.SerializerMethodField()
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = UserGamificationProfile
        fields = ['id', 'user', 'first_name', 'last_name', 'avatar', 'total_xp', 'level', 'current_streak', 'badges', 'recent_activity']

    def get_recent_activity(self, obj):
        records = XPRecord.objects.filter(profile=obj).order_by('-timestamp')[:5]
        return XPRecordSerializer(records, many=True).data

    def get_avatar(self, obj):
         # Mock or retrieve from profile if we had one
         return None

class LeaderboardEntrySerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source='user.id')
    name = serializers.ReadOnlyField(source='user.get_full_name')
    total_xp = serializers.IntegerField()
    level = serializers.IntegerField()
    badges_count = serializers.IntegerField(source='badges.count')
    rank = serializers.IntegerField(read_only=True)
