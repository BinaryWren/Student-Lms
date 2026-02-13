from rest_framework.permissions import BasePermission
from django.utils import timezone

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN')

class IsInstituteAdmin(BasePermission):
    def has_permission(self, request, view):
        # Allow SuperAdmin as well
        if request.user.role == 'SUPER_ADMIN':
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'INSTITUTE_ADMIN')

class IsInstituteMember(BasePermission):
    """
    Check if user belongs to the institute being accessed.
    This logic assumes the view filters by institute and specific object access checks 
    are handled by object permissions or filter backends.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsOwnInstitute(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'SUPER_ADMIN':
            return True
        return bool(request.user.role == 'INSTITUTE_ADMIN' and request.user.institute == obj)

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')

class IsAlumni(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ALUMNI')

class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'EMPLOYER')

class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        if request.user.role in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']: return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'INSTRUCTOR')

class IsCourseInstructor(BasePermission):
    """
    Object-level permission to only allow instructors of the course to edit/delete.
    Assumes `obj` has a `course` attribute or is a `Course`.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']: return True
        
        # If obj is Course
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
            
        # If obj has course attribute (like Assignment, Quiz)
        if hasattr(obj, 'course'):
            return obj.course.instructor == request.user
            
        return False

class IsHROrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['INSTITUTE_ADMIN', 'HR', 'SUPER_ADMIN']
