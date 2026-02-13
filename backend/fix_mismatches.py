import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User
from academics.models import StudentAdmission

def check_mismatches():
    print("Checking for Institute mismatches...")
    mismatches = []
    users = User.objects.filter(role='STUDENT')
    
    for u in users:
        adm = StudentAdmission.objects.filter(email=u.email).first()
        if adm:
            # Check if institutes match
            if u.institute != adm.institute:
                print(f"MISMATCH: {u.email}")
                print(f"  User Institute: {u.institute} (ID: {u.institute.id if u.institute else 'None'})")
                print(f"  Adm Institute:  {adm.institute} (ID: {adm.institute.id if adm.institute else 'None'})")
                
                # Auto-fix
                print("  -> FIXING...")
                u.institute = adm.institute
                
                # Update ID prefix if necessary
                if u.student_id:
                    correct_prefix = adm.institute.name[:3].upper() if adm.institute else 'STU'
                    # Assuming format PREFIX-YEAR-NUM
                    parts = u.student_id.split('-')
                    if len(parts) >= 2:
                        # If online, it's ONL-CODE-...
                        if u.course_mode == 'ONLINE' and parts[0] == 'ONL':
                            parts[1] = correct_prefix
                        else:
                            parts[0] = correct_prefix
                        
                        new_id = "-".join(parts)
                        if u.student_id != new_id:
                            print(f"  -> Updating ID from {u.student_id} to {new_id}")
                            u.student_id = new_id
                
                u.save()
                mismatches.append(u.email)

    print(f"Fixed {len(mismatches)} mismatches.")

if __name__ == '__main__':
    check_mismatches()
