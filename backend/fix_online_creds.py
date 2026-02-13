import os
import django
import random
import string
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

def fix_online_creds():
    online_students = User.objects.filter(role='STUDENT', course_mode='ONLINE')
    print(f'Processing {online_students.count()} Online Students...')
    
    repaired_count = 0
    for s in online_students:
        updated = False
        print(f"Checking {s.email}...")
        
        # 1. Fix Student ID (Ensure ONL- prefix)
        if not s.student_id or not s.student_id.startswith('ONL-'):
            inst_code = s.institute.name[:3].upper() if s.institute else 'STU'
            year = timezone.now().year
            
            while True:
                rnd = ''.join(random.choices(string.digits, k=4))
                sid = f"ONL-{inst_code}-{year}-{rnd}"
                if not User.objects.filter(student_id=sid).exists():
                    s.student_id = sid
                    updated = True
                    break
        
        # 2. Fix Username (Should be email for Online students)
        if s.username != s.email:
            s.username = s.email
            updated = True

        # 3. Fix Password (Generate if missing)
        if not s.raw_password:
            pw = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            s.set_password(pw)
            s.raw_password = pw
            updated = True
            
        if updated:
            s.save()
            repaired_count += 1
            print(f'  -> Repaired: ID={s.student_id}, PASS={s.raw_password}, USER={s.username}')
        else:
            print(f'  -> OK: ID={s.student_id}')

    print(f'Done. Repaired {repaired_count} records.')

if __name__ == '__main__':
    fix_online_creds()
