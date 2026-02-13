
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User
from django.contrib.auth import authenticate

print("--- User Debug Info ---")
users = User.objects.filter(role__in=['EMPLOYEE', 'HR']).order_by('-date_joined')

for u in users:
    print(f"User: {str(u.username):<20} | ID: {str(u.employee_id):<15} | Role: {str(u.role):<10} | Pass: {u.raw_password}")
    
    # Verify password
    if u.raw_password:
        # Try authenticate
        import requests
        try:
             url = "http://127.0.0.1:8000/api/auth/login/"
             data = {"username": u.username, "password": u.raw_password}
             res = requests.post(url, json=data)
             print(f"  -> Login API Status: {res.status_code}")
        except Exception as e:
             print(f"  -> API Failed: {e}")
    print("-" * 20)
