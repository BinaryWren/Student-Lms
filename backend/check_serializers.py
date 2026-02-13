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
    factory = APIRequestFactory()
    request = factory.get('/')
    
    # Test Course Serialization
    print("Testing Course Serializer...")
    try:
        courses = Course.objects.all()
        for c in courses:
            print(f"  Checking course: {c.title}")
            CourseSerializer(c, context={'request': request}).data
        print("Course Serializer PASS")
    except Exception:
        print("Course Serializer FAIL")
        traceback.print_exc()

    # Test LiveClass Serialization
    print("\nTesting LiveClass Serializer...")
    try:
        lives = LiveClass.objects.all()
        for l in lives:
            print(f"  Checking live class: {l.topic}")
            LiveClassSerializer(l).data
        print("LiveClass Serializer PASS")
    except Exception:
        print("LiveClass Serializer FAIL")
        traceback.print_exc()

    # Test Submission Serialization
    print("\nTesting Submission Serializer...")
    try:
        subs = Submission.objects.all()
        for s in subs:
            print(f"  Checking submission for student: {s.student}")
            SubmissionSerializer(s).data
        print("Submission Serializer PASS")
    except Exception:
        print("Submission Serializer FAIL")
        traceback.print_exc()

if __name__ == '__main__':
    test()
