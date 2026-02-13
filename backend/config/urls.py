from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import OrganizationViewSet, InstituteViewSet, UserViewSet, InvitationViewSet
from academics.views import (
    ProgramViewSet, BatchViewSet, CourseViewSet, 
    ModuleViewSet, LessonViewSet, EnrollmentViewSet,
    LessonResourceViewSet, AnnouncementViewSet, StudentDashboardView, InstructorDashboardView, InstructorAnalyticsView,
    InstituteDashboardView, InstituteAnalyticsView,
    AssignmentViewSet, SubmissionViewSet, QuestionBankViewSet, QuestionViewSet,
    QuizViewSet, QuizAttemptViewSet, LiveClassViewSet, AttendanceViewSet, ZoomCredentialViewSet,
    CertificateTemplateViewSet, CertificateViewSet, verify_certificate,
    CalendarEventViewSet, CalendarViewSet, StudentAdmissionViewSet, GradeChangeRequestViewSet,
    DailyAttendanceViewSet, AttendanceApplicationViewSet, ReadmissionApplicationViewSet,
    DocumentGalleryItemViewSet
)
from codelab.views import ProblemViewSet, LanguageViewSet, CodeSubmissionViewSet, CodeExecutionView
from notifications.views import NotificationViewSet

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
# Core
router.register(r'organizations', OrganizationViewSet)
router.register(r'institutes', InstituteViewSet)
router.register(r'users', UserViewSet)
router.register(r'zoom-credentials', ZoomCredentialViewSet)
router.register(r'invitations', InvitationViewSet, basename='invitations')
# Academics
router.register(r'programs', ProgramViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'resources', LessonResourceViewSet)
router.register(r'announcements', AnnouncementViewSet)
# Assessments
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'question-banks', QuestionBankViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'quiz-attempts', QuizAttemptViewSet)
# Live
router.register(r'live-classes', LiveClassViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'daily-attendance', DailyAttendanceViewSet)
router.register(r'attendance-applications', AttendanceApplicationViewSet)
# Certificates
router.register(r'certificate-templates', CertificateTemplateViewSet)
router.register(r'certificates', CertificateViewSet)
# Calendar
router.register(r'calendar-manual', CalendarEventViewSet)
router.register(r'calendar/events', CalendarViewSet, basename='calendar-events')
router.register(r'admissions', StudentAdmissionViewSet)
router.register(r'grade-change-requests', GradeChangeRequestViewSet)
router.register(r'readmissions', ReadmissionApplicationViewSet)
router.register(r'gallery', DocumentGalleryItemViewSet)

# CodeLab
router.register(r'problems', ProblemViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'code-submissions', CodeSubmissionViewSet)
# Notifications
router.register(r'notifications', NotificationViewSet, basename='notifications')

# Gamification
from gamification.views import GamificationViewSet
router.register(r'gamification', GamificationViewSet, basename='gamification')

# Careers
from careers.views import AlumniProfileViewSet, JobPostingViewSet, JobApplicationViewSet, EmployerViewSet
router.register(r'careers/alumni', AlumniProfileViewSet, basename='alumni')
router.register(r'careers/jobs', JobPostingViewSet, basename='jobs')
router.register(r'careers/applications', JobApplicationViewSet, basename='applications')
router.register(r'careers/employers', EmployerViewSet, basename='employers')

from careers.views import GraduateStudentsViewSet
router.register(r'careers/graduates', GraduateStudentsViewSet, basename='graduates')

from hr.views import EmployeeViewSet, EmployeeTaskViewSet, EmployeeAttendanceViewSet, LeaveRequestViewSet
router.register(r'hr/employees', EmployeeViewSet, basename='employees')
router.register(r'hr/tasks', EmployeeTaskViewSet, basename='employee-tasks')
router.register(r'hr/attendance', EmployeeAttendanceViewSet, basename='employee-attendance')
router.register(r'hr/leaves', LeaveRequestViewSet, basename='employee-leaves')

from finance.views import FeeRecordViewSet, SalaryRecordViewSet, OtherTransactionViewSet
router.register(r'finance/fees', FeeRecordViewSet, basename='fee-records')
router.register(r'finance/salaries', SalaryRecordViewSet, basename='salary-records')
router.register(r'finance/other-transactions', OtherTransactionViewSet, basename='other-transactions')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Specific API endpoints must come BEFORE the generic router include
    path('api/piston/execute/', CodeExecutionView.as_view(), name='codelab_execute'),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/verify/<str:unique_id>/', verify_certificate, name='verify_certificate'),
    path('api/student/dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('api/instructor/dashboard/', InstructorDashboardView.as_view(), name='instructor_dashboard'),
    path('api/instructor/analytics/', InstructorAnalyticsView.as_view(), name='instructor_analytics'),
    path('api/institute/dashboard/', InstituteDashboardView.as_view(), name='institute_dashboard'),
    path('api/institute/analytics/', InstituteAnalyticsView.as_view(), name='institute_analytics'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Generic Router (Catch-all for viewsets)
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
