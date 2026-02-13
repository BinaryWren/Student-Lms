import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from academics.models import *
from core.models import *
from academics.views import InstructorDashboardView
from rest_framework.test import APIRequestFactory, force_authenticate

def test():
    factory = APIRequestFactory()
    view = InstructorDashboardView.as_view()
    
    for user in User.objects.all():
        print(f"Testing user: {user.username} ({user.role})")
        request = factory.get('/')
        force_authenticate(request, user=user)
        try:
            response = view(request)
            if response.status_code == 500:
                print(f"  FAILED 500: {response.data}")
            else:
                print(f"  OK {response.status_code}")
        except Exception:
            print(f"  CRASHED")
            print(traceback.format_exc())

if __name__ == '__main__':
    test()
