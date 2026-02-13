from core.models import Institute

def get_active_institute(request):
    user = request.user
    if not user.is_authenticated: return None
    
    institute_id = request.headers.get('X-Institute-ID')
    if user.role == 'SUPER_ADMIN' and institute_id:
        try:
             return Institute.objects.get(id=institute_id)
        except (Institute.DoesNotExist, ValueError):
             pass
             
    return user.institute
