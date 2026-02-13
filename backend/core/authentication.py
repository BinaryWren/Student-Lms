from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class StudentIdBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            # Try to fetch the user by username OR student_id
            # We assume student_id is unique enough or we take the first match if multiple (should be unique)
            user = User.objects.get(Q(username=username) | Q(student_id=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
             # This shouldn't happen if fields are unique, but just in case
            return None
        except Exception:
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
