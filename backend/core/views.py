from rest_framework import viewsets, permissions, filters
from rest_framework import status
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from .models import User, Institute, Organization
from .serializers import UserSerializer, InstituteSerializer, OrganizationSerializer
from .permissions import IsSuperAdmin, IsInstituteAdmin, IsOwnInstitute
from .utils import get_active_institute
from django.db import transaction
from django.utils import timezone

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsSuperAdmin]

class InstituteViewSet(viewsets.ModelViewSet):
    queryset = Institute.objects.all()
    serializer_class = InstituteSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Institute.objects.none()
        if user.role == 'SUPER_ADMIN':
            return Institute.objects.all()
        if user.institute:
            return Institute.objects.filter(id=user.institute.id)
        return Institute.objects.none()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action in ['create', 'destroy']:
            return [IsInstituteAdmin()]
        # Update, Partial Update
        return [permissions.IsAuthenticated(), IsOwnInstitute()]
    
    def perform_create(self, serializer):
        # Ensure there's an organization
        from core.models import Organization
        org, _ = Organization.objects.get_or_create(
            slug="default",
            defaults={'name': 'Default Organization'}
        )
        
        serializer.save(organization=org)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['role', 'institute']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resend_credentials(self, request, pk=None):
        user = self.get_object()
        resend_type = request.data.get('type', 'Email')
        # Here you would actually call your Email/SMS service
        print(f"RESENDING CREDENTIALS: {resend_type} to {user.email if resend_type == 'Email' else 'phone'}")
        print(f"ID: {user.student_id}, PASS: {user.raw_password}")
        return Response({'status': f'Resent via {resend_type}'})

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({'error': 'Password is required'}, status=400)
            
        # Permissions: Self, or Admin changing a Student's password
        if request.user.id != user.id and request.user.role not in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']:
            return Response({'error': 'Permission denied'}, status=403)
            
        user.set_password(new_password)
        user.raw_password = new_password
        user.save()
        
    @action(detail=False, methods=['post'])
    def bulk_repair_credentials(self, request):
        if request.user.role not in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']:
            return Response({'error': 'Permission denied'}, status=403)
            
        students = User.objects.filter(role='STUDENT')
        if request.user.role == 'INSTITUTE_ADMIN':
            students = students.filter(institute=request.user.institute)
            
        import random
        import string
        from academics.models import StudentAdmission
        count = 0
        
        for student in students:
            updated = False
            
            # Try to sync mode from admission if missing
            admission = StudentAdmission.objects.filter(email=student.email).first()
            if admission and not student.course_mode:
                student.course_mode = admission.course_mode
                updated = True
                
            if not student.student_id:
                inst_code = student.institute.name[:3].upper() if student.institute else "STU"
                year = timezone.now().year
                prefix = f"ONL-{inst_code}" if student.course_mode == 'ONLINE' else inst_code
                
                while True:
                    random_num = ''.join(random.choices(string.digits, k=4))
                    new_id = f"{prefix}-{year}-{random_num}"
                    if not User.objects.filter(student_id=new_id).exists():
                        student.student_id = new_id
                        # For offline students, username should match student_id
                        if student.course_mode != 'ONLINE':
                            student.username = new_id
                        break
                updated = True
            
            if not student.raw_password:
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
                student.set_password(password)
                student.raw_password = password
                updated = True
                
            if updated:
                student.save()
                count += 1
            
        return Response({'status': f'Processed {count} student records'})

    @action(detail=False, methods=['post'])
    def sync_missing_users(self, request):
        """Creates User accounts for admissions that were approved but have no User record."""
        if request.user.role not in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']:
            return Response({'error': 'Permission denied'}, status=403)
            
        from academics.models import StudentAdmission
        from academics.views import StudentAdmissionViewSet
        
        admissions = StudentAdmission.objects.filter(status='APPROVED')
        if request.user.role == 'INSTITUTE_ADMIN':
            admissions = admissions.filter(institute=request.user.institute)
            
        count = 0
        handler = StudentAdmissionViewSet()
        for adm in admissions:
            if not User.objects.filter(email=adm.email).exists():
                handler._process_enrollment(adm)
                count += 1
                
        return Response({'status': f'Created {count} missing user accounts'})

    @action(detail=False, methods=['post'])
    def sync_student_usernames(self, request):
        if request.user.role not in ['SUPER_ADMIN', 'INSTITUTE_ADMIN']:
            return Response({'error': 'Permission denied'}, status=403)
            
        students = User.objects.filter(role='STUDENT', student_id__isnull=False)
        if request.user.role == 'INSTITUTE_ADMIN':
            students = students.filter(institute=request.user.institute)
            
        count = 0
        for student in students:
            if student.username != student.student_id:
                # verify if target username is available
                if not User.objects.filter(username=student.student_id).exists():
                    student.username = student.student_id
                    student.save()
                    count += 1
        
    @action(detail=True, methods=['post'])
    def upload_docs(self, request, pk=None):
        from .models import InstructorProfile
        try:
            user = self.get_object()
            profile, _ = InstructorProfile.objects.get_or_create(user=user)
            
            # Manual file handling from request.FILES
            if 'profile_picture' in request.FILES:
                profile.profile_picture = request.FILES['profile_picture']
            if 'cv_file' in request.FILES:
                profile.cv_file = request.FILES['cv_file']
            
            # Also handle text fields if sent as FormData here for convenience (optional)
            for field in ['linkedin_url', 'website_url', 'address', 'experience']:
                if field in request.data:
                    setattr(profile, field, request.data[field])
            
            profile.save()
            return Response({'status': 'Profile updated with files'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        institute = get_active_institute(self.request)
        if institute:
             return User.objects.filter(institute=institute)

        if user.role == 'SUPER_ADMIN':
            return User.objects.all()
        
        # Fallback: Can only see self
        return User.objects.filter(id=user.id)

from .models import InstructorInvitation

class InvitationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny] # We handle permissions manually per action

    @action(detail=False, methods=['post'], permission_classes=[IsInstituteAdmin])
    def invite(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
             return Response({'error': 'User with this email already exists'}, status=400)

        invite = InstructorInvitation.objects.create(
            email=email,
            institute=request.user.institute
        )
        
        # In production, send email here.
        # For now, return the link.
        link = f"{settings.FRONTEND_URL}/join-instructor/{invite.token}"
        print(f"INVITATION LINK: {link}")
        
        return Response({'status': 'Invitation sent', 'link': link})

    @action(detail=False, methods=['get'])
    def validate(self, request):
        token = request.query_params.get('token')
        try:
            invite = InstructorInvitation.objects.get(token=token, is_used=False)
            return Response({
                'valid': True, 
                'email': invite.email, 
                'institute_id': invite.institute.id,
                'institute_name': invite.institute.name
            })
        except InstructorInvitation.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid or used token'}, status=400)

    @action(detail=False, methods=['post'])
    def accept(self, request):
        token = request.data.get('token')
        password = request.data.get('password')
        # username = request.data.get('username') # Ignore username, use generated ID
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        
        # Profile Data
        profile_data = request.data.get('profile', {})

        try:
            invite = InstructorInvitation.objects.get(token=token, is_used=False)
        except InstructorInvitation.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=400)

        # Create User
        try:
            with transaction.atomic():
                # Generate unique ID
                inst_code = invite.institute.name[:3].upper() if invite.institute else "INS"
                year = timezone.now().year
                
                import random
                import string
                
                new_id = ""
                while True:
                    random_num = ''.join(random.choices(string.digits, k=4))
                    new_id = f"INS-{inst_code}-{year}-{random_num}"
                    if not User.objects.filter(instructor_id=new_id).exists() and not User.objects.filter(username=new_id).exists():
                        break
                
                user = User.objects.create_user(
                    username=new_id, # Set username to ID
                    email=invite.email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role='INSTRUCTOR',
                    institute=invite.institute
                )
                user.instructor_id = new_id
                user.raw_password = password
                user.save()
                
                # Create Profile
                if profile_data:
                    from .models import InstructorProfile
                    profile = InstructorProfile.objects.create(user=user)
                    for k, v in profile_data.items():
                        if hasattr(profile, k):
                            setattr(profile, k, v)
                    profile.save()

                invite.is_used = True
                invite.save()
                
                return Response({
                    'status': 'Instructor registered successfully', 
                    'user_id': user.id,
                    'instructor_id': new_id
                })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

