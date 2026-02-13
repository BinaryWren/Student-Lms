from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import User
from academics.models import Assignment, Submission, Quiz, QuizAttempt, Enrollment, Certificate
from notifications.models import Notification, NotificationPreference

class Command(BaseCommand):
    help = 'Runs checks for smart reminders and generates notifications.'

    def handle(self, *args, **options):
        self.stdout.write("Running Smart Reminders...")
        
        now = timezone.now()
        
        # 1. Assignment Reminders (Due within 24 hours)
        self.stdout.write("- Checking Assignments...")
        upcoming_assignments = Assignment.objects.filter(
            due_date__gt=now,
            due_date__lte=now + timedelta(hours=24)
        )
        
        for assignment in upcoming_assignments:
            # Find students in the course
            # Optimized: Get students enrolled in batches of the assignment's course
            students = User.objects.filter(
                enrollments__batch__courses=assignment.course,
                role='STUDENT'
            ).distinct()
            
            for student in students:
                # Check preferences
                prefs, _ = NotificationPreference.objects.get_or_create(user=student)
                if not prefs.assignment_reminders: continue
                
                # Check if already submitted
                if Submission.objects.filter(assignment=assignment, student=student).exists():
                    continue
                
                # Check duplicate notification (spam throttle: don't send if sent in last 24h)
                if Notification.objects.filter(
                    user=student, 
                    title__contains=f"Assignment Due: {assignment.title}",
                    created_at__gte=now - timedelta(hours=23)
                ).exists():
                    continue

                Notification.objects.create(
                    user=student,
                    title=f"Assignment Due: {assignment.title}",
                    message=f"You have an assignment due on {assignment.due_date.strftime('%Y-%m-%d %H:%M')}. Submit it soon!",
                    notification_type='WARNING',
                    link='/student/assignments'
                )
                self.stdout.write(f"  > Notified {student.username} for {assignment.title}")

        # 2. Quiz Reminders (Starts within 1 hour)
        self.stdout.write("- Checking Quizzes...")
        upcoming_quizzes = Quiz.objects.filter(
            start_time__gt=now,
            start_time__lte=now + timedelta(hours=1),
            is_exam_mode=True
        )
        for quiz in upcoming_quizzes:
             students = User.objects.filter(
                enrollments__batch__courses=quiz.course,
                role='STUDENT'
            ).distinct()
             
             for student in students:
                prefs, _ = NotificationPreference.objects.get_or_create(user=student)
                if not prefs.quiz_reminders: continue

                if Notification.objects.filter(user=student, title__contains=f"Exam Starting: {quiz.title}").exists():
                    continue
                
                Notification.objects.create(
                    user=student,
                    title=f"Exam Starting: {quiz.title}",
                    message=f"The exam '{quiz.title}' starts in less than an hour. Get ready!",
                    notification_type='WARNING',
                    link='/student/quizzes'
                )

        # 3. Certificate Readiness
        self.stdout.write("- Checking Certificates...")
        new_certs = Certificate.objects.filter(status='ISSUED', issued_at__gte=now - timedelta(days=1))
        for cert in new_certs:
             prefs, _ = NotificationPreference.objects.get_or_create(user=cert.student)
             if not prefs.cert_availability: continue

             if Notification.objects.filter(user=cert.student, title__contains=f"Certificate Earned").exists():
                 continue
             
             Notification.objects.create(
                 user=cert.student,
                 title=f"Certificate Earned: {cert.course.title}",
                 message="Congratulations! Your certificate is ready to download.",
                 notification_type='SUCCESS',
                 link='/student/certificates'
             )

        # 4. Inactivity Warnings (7 days)
        self.stdout.write("- Checking Inactivity...")
        inactive_cutoff = now - timedelta(days=7)
        inactive_students = User.objects.filter(role='STUDENT', last_login__lt=inactive_cutoff) 
        
        for student in inactive_students:
             prefs, _ = NotificationPreference.objects.get_or_create(user=student)
             if not prefs.inactivity_warnings: continue
             
             # Throttle: 1 per week
             if Notification.objects.filter(user=student, title="We Miss You!", created_at__gte=now - timedelta(days=6)).exists():
                 continue

             Notification.objects.create(
                 user=student,
                 title="We Miss You!",
                 message="It's been a while since we saw you. Come back and continue learning!",
                 notification_type='INFO',
                 link='/student/dashboard'
             )

        self.stdout.write("Done.")

        # 5. Manual Event Reminders (Institute-wide)
        self.stdout.write("- Checking Manual Events...")
        from academics.models import CalendarEvent # Late import or move top
        upcoming_events = CalendarEvent.objects.filter(
            start_time__gt=now,
            start_time__lte=now + timedelta(hours=24)
        )
        
        for event in upcoming_events:
            # Notify all active users in the institute
            users = User.objects.filter(institute=event.institute, role__in=['STUDENT', 'INSTRUCTOR'], is_active=True)
            for user in users:
                # Check for duplicate within 24h
                if Notification.objects.filter(
                    user=user, 
                    title__contains=f"Event: {event.title}",
                    created_at__gte=now - timedelta(hours=23)
                ).exists():
                    continue

                link = '/student/calendar' if user.role == 'STUDENT' else '/instructor/calendar'
                
                Notification.objects.create(
                    user=user,
                    title=f"Upcoming Event: {event.title}",
                    message=f"{event.title} starts tomorrow at {event.start_time.strftime('%H:%M')}. Don't miss it!",
                    notification_type='INFO',
                    link=link
                )
                self.stdout.write(f"  > Notified {user.username} for event {event.title}")
