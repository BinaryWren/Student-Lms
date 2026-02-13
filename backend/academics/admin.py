from django.contrib import admin
from .models import (
    Program, Batch, Course, Module, Lesson, Enrollment, LessonResource, LessonProgress, 
    Announcement, Assignment, Submission, QuestionBank, Question, Quiz, QuizAttempt, 
    LiveClass, Attendance, CertificateTemplate, Certificate, CalendarEvent, StudentAdmission
)

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'institute')
    list_filter = ('institute',)
    search_fields = ('name', 'code')

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'program', 'start_date', 'end_date')
    list_filter = ('program__institute',)

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'batch', 'instructor')
    list_filter = ('batch__program__institute', 'instructor')
    search_fields = ('title', 'code')
    inlines = [ModuleInline]

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [LessonInline]

class LessonResourceInline(admin.TabularInline):
    model = LessonResource
    extra = 1

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'content_type', 'order')
    list_filter = ('module__course', 'content_type')
    inlines = [LessonResourceInline]

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'batch', 'active', 'enrolled_at')
    list_filter = ('batch', 'active')
    search_fields = ('student__username', 'student__email')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'completed_at')
    list_filter = ('is_completed',)

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'total_points')
    list_filter = ('course',)

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'submitted_at', 'grade')
    list_filter = ('assignment',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'is_exam_mode', 'start_time')
    list_filter = ('course', 'is_exam_mode')

@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'institute')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('unique_id', 'student', 'course', 'status', 'issued_at')
    list_filter = ('status', 'course')
    readonly_fields = ('unique_id', 'issued_at')

@admin.register(StudentAdmission)
class StudentAdmissionAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'status', 'applied_at')
    list_filter = ('status', 'institute')
    actions = ['approve_admission']

    def approve_admission(self, request, queryset):
        for admission in queryset:
            if admission.status != 'APPROVED':
                admission.status = 'APPROVED'
                admission.save() # Signals/Save logic will handle user creation
    approve_admission.short_description = "Approve selected admissions"

# Register remaining models simply
admin.site.register(LessonResource)
admin.site.register(Announcement)
admin.site.register(QuestionBank)
admin.site.register(Question)
admin.site.register(QuizAttempt)
admin.site.register(LiveClass)
admin.site.register(Attendance)
admin.site.register(CalendarEvent)
