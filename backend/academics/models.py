from django.db import models
from core.models import Institute, User

class Program(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50) 
    description = models.TextField(blank=True)
    def __str__(self): return f"{self.name} ({self.institute.name})"

class Batch(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    def __str__(self): return f"{self.name} - {self.program.name}"

class Course(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='courses_taught')
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    is_online_course = models.BooleanField(default=False)
    def __str__(self): return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ['order']
    def __str__(self): return self.title

class Lesson(models.Model):
    class ContentType(models.TextChoices):
        VIDEO = 'VIDEO', 'Video'
        ARTICLE = 'ARTICLE', 'Article'
        QUIZ = 'QUIZ', 'Quiz'

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20, choices=ContentType.choices, default=ContentType.ARTICLE)
    content_url = models.URLField(blank=True, null=True)
    content_body = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    class Meta: ordering = ['order']
    def __str__(self): return self.title

class LessonResource(models.Model):
    class ResourceType(models.TextChoices):
        PDF = 'PDF', 'PDF Document'
        LINK = 'LINK', 'External Link'
        FILE = 'FILE', 'Other File'

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices, default=ResourceType.LINK)
    url = models.URLField(blank=True, null=True)
    file_attachment = models.FileField(upload_to='resources/', blank=True, null=True) 
    def __str__(self): return self.title

class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive (Absent)'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True) # Legacy flag, prioritizing status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    last_attendance_date = models.DateField(null=True, blank=True)
    
    # Streak & Access
    is_locked = models.BooleanField(default=False)
    current_streak = models.PositiveIntegerField(default=0)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta: unique_together = ('student', 'batch')
    def __str__(self): return f"{self.student.username} -> {self.batch.name}"

class DailyAttendance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_attendance')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='daily_attendance')
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, default='PRESENT')
    
    class Meta: 
        unique_together = ('student', 'course', 'date')
        verbose_name_plural = "Daily Attendance"

class AttendanceApplication(models.Model):
    class Status(models.TextChoices):
        PENDING_INSTRUCTOR = 'PENDING_INSTRUCTOR', 'Pending Instructor Review'
        PENDING_ADMIN = 'PENDING_ADMIN', 'Pending Admin Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_applications')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_applications')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_INSTRUCTOR)
    created_at = models.DateTimeField(auto_now_add=True)
    instructor_comment = models.TextField(blank=True)
    admin_comment = models.TextField(blank=True)
    
    def __str__(self): return f"App from {self.student.username} for {self.course.title}"

class ReadmissionApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Admin Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='readmission_applications')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='readmission_applications')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    admin_comment = models.TextField(blank=True)
    
    
    def __str__(self): return f"Readmission for {self.student.username} - {self.status}"

class DocumentGalleryItem(models.Model):
    class ItemType(models.TextChoices):
        FILE = 'FILE', 'File (PDF, etc.)'
        LINK = 'LINK', 'External Link'
        
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='gallery_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    item_type = models.CharField(max_length=10, choices=ItemType.choices, default=ItemType.FILE)
    
    file = models.FileField(upload_to='gallery/docs/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='gallery_items')
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self): return self.title


class LessonProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='student_progress')
    completed_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=True)
    class Meta: unique_together = ('student', 'lesson')

class Announcement(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='announcements')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='announcements') 
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    def __str__(self): return self.title

# --- Assessment Models ---

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    total_points = models.PositiveIntegerField(default=100)
    rubric = models.JSONField(default=dict, blank=True) # e.g. {"criteria": [{"name": "logic", "points": 10}]}
    max_attempts = models.PositiveIntegerField(default=1)

    class AssignmentType(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular Assignment'
        PRE_ASSESSMENT = 'PRE_ASSESSMENT', 'Pre-Assessment'
        POST_ASSESSMENT = 'POST_ASSESSMENT', 'Post-Assessment'

    assignment_type = models.CharField(
        max_length=20, 
        choices=AssignmentType.choices, 
        default=AssignmentType.REGULAR
    )

    def __str__(self): return self.title

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='submissions/')
    checksum = models.CharField(max_length=64, blank=True) # SHA-256
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.FloatField(blank=True, null=True)
    feedback = models.TextField(blank=True)

    def __str__(self): return f"{self.assignment.title} - {self.student.username}"

class GradeChangeRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='change_requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grade_change_requests')
    new_grade = models.FloatField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    admin_comment = models.TextField(blank=True)

    def __str__(self): return f"Request for {self.submission} by {self.requested_by.username}"

class QuestionBank(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='question_banks')
    name = models.CharField(max_length=255)
    def __str__(self): return self.name

class Question(models.Model):
    class Type(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        SHORT_ANSWER = 'SHORT', 'Short Answer'

    bank = models.ForeignKey(QuestionBank, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=Type.choices, default=Type.MCQ)
    options = models.JSONField(default=list, blank=True) # e.g. [{"id": "a", "text": "Option A"}, ...]
    correct_answer = models.JSONField(default=dict) # e.g. {"id": "a"} or {"text": "exact match"}
    points = models.PositiveIntegerField(default=1)

    def __str__(self): return self.text[:50]

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    questions = models.ManyToManyField(Question, related_name='quizzes', blank=True)
    
    # Settings
    time_limit_minutes = models.PositiveIntegerField(default=60)
    max_attempts = models.PositiveIntegerField(default=1)
    is_exam_mode = models.BooleanField(default=False)
    passing_percentage = models.PositiveIntegerField(default=50)
    
    class QuizType(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular Quiz'
        PRE_ASSESSMENT = 'PRE_ASSESSMENT', 'Pre-Assessment'
        POST_ASSESSMENT = 'POST_ASSESSMENT', 'Post-Assessment'
        
    quiz_type = models.CharField(
        max_length=20, 
        choices=QuizType.choices, 
        default=QuizType.REGULAR
    )

    # Active Window
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self): return self.title

class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    def __str__(self): return f"{self.quiz.title} - {self.student.username}"

class LiveClass(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='live_classes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='live_classes')
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='hosted_classes')
    topic = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    
    # Zoom specific
    zoom_meeting_id = models.CharField(max_length=100, blank=True)
    join_url = models.URLField(max_length=1000, blank=True)
    start_url = models.URLField(max_length=1000, blank=True) # For host
    password = models.CharField(max_length=50, blank=True)
    
    # Post-class
    recording_url = models.URLField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self): return f"{self.topic} ({self.start_time})"

class Attendance(models.Model):
    live_class = models.ForeignKey(LiveClass, on_delete=models.CASCADE, related_name='attendance')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    joined_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent')], default='ABSENT')

    class Meta: unique_together = ('live_class', 'student')

class CertificateTemplate(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='certificate_templates')
    name = models.CharField(max_length=255)
    background_image = models.ImageField(upload_to='certificates/templates/backgrounds/', blank=True, null=True)
    logo = models.ImageField(upload_to='certificates/templates/logos/', blank=True, null=True)
    signature_image = models.ImageField(upload_to='certificates/templates/signatures/', blank=True, null=True)
    title_text = models.CharField(max_length=255, default="Certificate of Completion")
    body_text = models.TextField(default="This is to certify that {student_name} has successfully completed the course {course_name}.")
    
    def __str__(self): return f"{self.name} - {self.institute.name}"

import uuid

class Certificate(models.Model):
    class Status(models.TextChoices):
        ISSUED = 'ISSUED', 'Issued'
        REVOKED = 'REVOKED', 'Revoked'

    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='certificates')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True, related_name='certificates')
    template = models.ForeignKey(CertificateTemplate, on_delete=models.SET_NULL, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)
    pdf_file = models.FileField(upload_to='certificates/generated/', blank=True, null=True)

    def __str__(self): return f"{self.student.username} - {self.unique_id}"

class CalendarEvent(models.Model):
    class Type(models.TextChoices):
        HOLIDAY = 'HOLIDAY', 'Holiday'
        EVENT = 'EVENT', 'Event'
        MEETING = 'MEETING', 'Meeting'

    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='calendar_events')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='calendar_events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    event_type = models.CharField(max_length=20, choices=Type.choices, default=Type.EVENT)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self): return self.title

class StudentAdmission(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='admissions')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='admissions')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='admissions')
    class CourseMode(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
    
    course_mode = models.CharField(max_length=10, choices=CourseMode.choices, default=CourseMode.OFFLINE)
    
    # Personal Info
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100)
    gender = models.CharField(max_length=20)
    date_of_birth = models.DateField(null=True, blank=True)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField()
    
    # Social/Professional
    linkedin_profile = models.URLField(max_length=500, blank=True)
    experience = models.TextField(blank=True)
    current_employer_university = models.TextField(blank=True)
    
    # Files
    photo = models.ImageField(upload_to='admissions/photos/', null=True, blank=True)
    resume_cv = models.FileField(upload_to='admissions/resumes/', null=True, blank=True)
    
    # Guardian Info
    guardian_type = models.CharField(max_length=20) # Father, Mother, Self
    
    father_name = models.CharField(max_length=255, blank=True)
    father_phone = models.CharField(max_length=20, blank=True)
    father_occupation = models.CharField(max_length=255, blank=True)
    
    mother_name = models.CharField(max_length=255, blank=True)
    mother_phone = models.CharField(max_length=20, blank=True)
    mother_occupation = models.CharField(max_length=255, blank=True)
    
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_relation = models.CharField(max_length=100, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    guardian_occupation = models.CharField(max_length=255, blank=True)
    guardian_email = models.EmailField(blank=True, null=True)
    guardian_address = models.TextField(blank=True)
    
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING')

    def __str__(self): return f"{self.first_name} {self.last_name} - {self.course.title if self.course else 'No Course'}"
