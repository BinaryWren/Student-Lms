from django.db import models
from core.models import User, Institute

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Leave tracking
    monthly_leave_quota = models.IntegerField(default=2)
    remaining_leaves = models.DecimalField(max_digits=4, decimal_places=1, default=2.0)
    
    # Optional: status tracking, leaves, etc.
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.designation}"

class EmployeeTask(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} -> {self.employee.get_full_name()}"

class EmployeeAttendance(models.Model):
    ATTENDANCE_STATUS = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('LEAVE', 'On Leave'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emp_attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS, default='PRESENT')
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('employee', 'date')
        verbose_name_plural = "Employee Attendance"

class LeaveRequest(models.Model):
    LEAVE_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    LEAVE_TYPES = [
        ('SICK', 'Sick Leave'),
        ('CASUAL', 'Casual Leave'),
        ('EMERGENCY', 'Emergency Leave'),
        ('OTHER', 'Other'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emp_leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES, default='CASUAL')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=LEAVE_STATUS, default='PENDING')
    hr_comments = models.TextField(blank=True, null=True)
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Leave: {self.employee.username} ({self.start_date} to {self.end_date})"
