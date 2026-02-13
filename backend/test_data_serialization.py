import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from academics.models import *
from core.models import *
from academics.serializers import *
from rest_framework.test import APIRequestFactory

def test():
    factory = APIRequestFactory()
    req = factory.get('/')
    
    # Test EVERY SINGLE Course
    for c in Course.objects.all():
        print(f"Course: {c.title}")
        try:
            CourseSerializer(c, context={'request': req}).data
            print("  OK")
        except Exception:
            print("  FAILED")
            traceback.print_exc()

    # Test EVERY SINGLE Live Class
    for l in LiveClass.objects.all():
        print(f"Live Class: {l.topic}")
        try:
            LiveClassSerializer(l, context={'request': req}).data
            print("  OK")
        except Exception:
            print("  FAILED")
            traceback.print_exc()

if __name__ == '__main__':
    test()
