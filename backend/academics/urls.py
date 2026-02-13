from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramViewSet, BatchViewSet, CourseViewSet, 
    ModuleViewSet, LessonViewSet, EnrollmentViewSet,
    LessonResourceViewSet, AnnouncementViewSet, AssignmentViewSet, SubmissionViewSet,
    QuestionBankViewSet, QuestionViewSet, QuizViewSet, QuizAttemptViewSet,
    LiveClassViewSet, AttendanceViewSet, StudentAdmissionViewSet,
    CertificateTemplateViewSet, CertificateViewSet, CalendarEventViewSet, GradeChangeRequestViewSet,
    CalendarViewSet, StudentDashboardView, InstructorDashboardView,
    ZoomCredentialViewSet
)

router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'resources', LessonResourceViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'question-banks', QuestionBankViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'quiz-attempts', QuizAttemptViewSet)
router.register(r'live-classes', LiveClassViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'admissions', StudentAdmissionViewSet)
router.register(r'certificate-templates', CertificateTemplateViewSet)
router.register(r'certificates', CertificateViewSet)
router.register(r'calendar-events', CalendarEventViewSet)
router.register(r'grade-change-requests', GradeChangeRequestViewSet)
router.register(r'calendar', CalendarViewSet, basename='calendar')
router.register(r'zoom-credentials', ZoomCredentialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
