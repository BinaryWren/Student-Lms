from rest_framework import serializers
from .models import (
    Program, Batch, Course, Module, Lesson, Enrollment, LessonResource, LessonProgress, Announcement,
    Assignment, Submission, QuestionBank, Question, Quiz, QuizAttempt, LiveClass, Attendance,
    CertificateTemplate, Certificate, CalendarEvent, StudentAdmission, GradeChangeRequest,
    DailyAttendance, AttendanceApplication, ReadmissionApplication, DocumentGalleryItem
)
from core.models import User
from core.serializers import UserSerializer

class StudentAdmissionSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.title')
    batch_name = serializers.ReadOnlyField(source='batch.name')
    institute_name = serializers.ReadOnlyField(source='institute.name')

    class Meta:
        model = StudentAdmission
        fields = '__all__'

    def validate(self, data):
        email = data.get('email')
        batch = data.get('batch')
        if email and batch:
            exists = StudentAdmission.objects.filter(
                email=email, 
                batch=batch, 
                status__in=['PENDING', 'APPROVED']
            ).exists()
            if exists:
                raise serializers.ValidationError("An admission application for this email and batch already exists.")
        return data

class CertificateTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateTemplate
        fields = '__all__'

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    course_title = serializers.ReadOnlyField(source='course.title')
    program_name = serializers.ReadOnlyField(source='program.name')
    template_name = serializers.ReadOnlyField(source='template.name')

    class Meta:
        model = Certificate
        fields = '__all__'

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = '__all__'

# ... (Previous Serializers: LessonResource, Lesson, Module, Course, Batch, Program, Enrollment, Announcement, LessonProgress, DashboardSummary)
# I will retain them but since I am overwriting the file, I must include ALL serializers again.

class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResource
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    resources = LessonResourceSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_is_completed(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated:
            return LessonProgress.objects.filter(student=user, lesson=obj, is_completed=True).exists()
        return False

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else "Unassigned"

    def get_enrolled_count(self, obj):
        if obj.batch:
            return Enrollment.objects.filter(batch=obj.batch, active=True).count()
        return 0

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated:
            total_lessons = Lesson.objects.filter(module__course=obj).count()
            if total_lessons == 0:
                return 0
            completed = LessonProgress.objects.filter(student=user, lesson__module__course=obj, is_completed=True).count()
            return int((completed / total_lessons) * 100)
        return 0

class BatchSerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    program_name = serializers.ReadOnlyField(source='program.name')
    class Meta:
        model = Batch
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    batches = BatchSerializer(many=True, read_only=True)
    class Meta:
        model = Program
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='student', write_only=True)
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), source='batch', write_only=True)
    batch_name = serializers.ReadOnlyField(source='batch.name')
    program_name = serializers.ReadOnlyField(source='batch.program.name')
    class Meta:
        model = Enrollment
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    class Meta:
        model = Announcement
        fields = '__all__'

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = '__all__'

class DashboardSummarySerializer(serializers.Serializer):
    enrollments = EnrollmentSerializer(many=True)
    active_courses = CourseSerializer(many=True)
    announcements = AnnouncementSerializer(many=True)
    upcoming_exams = serializers.ListField(child=serializers.DictField()) 

# --- New Assessment Serializers ---

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['checksum', 'submitted_at', 'grade', 'feedback', 'student']

    def validate_file(self, value):
        # Security: Basic extension check and Mock Audit
        ext = value.name.split('.')[-1].lower()
        if ext in ['exe', 'bat', 'sh', 'php']:
            from core.models import AuditLog
            # Log attempt
            # (In a real view, we'd have access to request.user, but here we might not easily without context)
            raise serializers.ValidationError("File type not allowed.")
        
        # Mock Scanning Hook
        # if malware_scan(value).found: raise ...
        
        return value

class GradeChangeRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.ReadOnlyField(source='requested_by.get_full_name')
    submission_title = serializers.ReadOnlyField(source='submission.assignment.title')
    student_name = serializers.ReadOnlyField(source='submission.student.get_full_name')
    current_grade = serializers.ReadOnlyField(source='submission.grade')
    institute_name = serializers.SerializerMethodField()
    
    class Meta:
        model = GradeChangeRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'requested_by', 'admin_comment']

    def get_institute_name(self, obj):
        try:
             return obj.submission.student.institute.name
        except AttributeError:
             return "N/A"

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class QuestionBankSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = QuestionBank
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = '__all__'

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = '__all__'

class LiveClassSerializer(serializers.ModelSerializer):
    batch_name = serializers.ReadOnlyField(source='batch.name')
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = LiveClass
        fields = '__all__'
        read_only_fields = ['join_url', 'start_url', 'password']

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else "Unassigned"

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class Meta:
        model = Attendance
        fields = '__all__'

class DailyAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class Meta:
        model = DailyAttendance
        fields = '__all__'

class AttendanceApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    course_title = serializers.ReadOnlyField(source='course.title')
    class Meta:
        model = AttendanceApplication
        fields = '__all__'

class ReadmissionApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source='enrollment')
    course_title = serializers.ReadOnlyField(source='enrollment.batch.program.name') # Broad approximation, usually batch linked
    
    class Meta:
        model = ReadmissionApplication
        fields = '__all__'
        read_only_fields = ['student', 'status', 'admin_comment', 'created_at']


class DocumentGalleryItemSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.get_full_name')
    class Meta:
        model = DocumentGalleryItem
        fields = '__all__'
        read_only_fields = ['created_at', 'uploaded_by', 'institute']
