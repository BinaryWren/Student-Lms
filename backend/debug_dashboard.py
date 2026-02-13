import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from academics.models import Course, LiveClass, Submission
from core.models import User
from academics.serializers import CourseSerializer, LiveClassSerializer, SubmissionSerializer
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

def test():
    user = User.objects.filter(role='INSTRUCTOR').first()
    if not user:
        print("No instructor found")
        return
    
    factory = APIRequestFactory()
    request = factory.get('/')
    force_authenticate(request, user=user)
    
    try:
        courses_taught = Course.objects.filter(instructor=user)
        course_ids = courses_taught.values_list('id', flat=True)

        upcoming_live_classes = LiveClass.objects.filter(
            instructor=user, 
            start_time__gte=timezone.now()
        ).order_by('start_time')[:5]

        pending_grading = Submission.objects.filter(
            assignment__course__id__in=course_ids,
            grade__isnull=True
        ).order_by('-submitted_at')[:5]

        data = {
            'courses': CourseSerializer(courses_taught, many=True, context={'request': request}).data,
            'upcoming_live_classes': LiveClassSerializer(upcoming_live_classes, many=True).data,
            'pending_grading': SubmissionSerializer(pending_grading, many=True).data,
        }
        print('SUCCESS')
    except Exception as e:
        print(traceback.format_exc())

if __name__ == '__main__':
    test()
