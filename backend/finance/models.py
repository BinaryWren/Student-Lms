from django.db import models
from core.models import User, Institute

class FeeRecord(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
        ('UNPAID', 'Unpaid'),
    ]
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('ONLINE', 'Online Payment'),
        ('CHEQUE', 'Cheque'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fee_records')
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='fee_records')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='CASH')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNPAID')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fee: {self.student.get_full_name()} - {self.status}"

class SalaryRecord(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='salary_records')
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='salary_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.IntegerField() # 1-12
    year = models.IntegerField()
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"Salary: {self.employee.get_full_name()} - {self.month}/{self.year}"

class OtherTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('INCOME', 'Income/Revenue'),
        ('EXPENSE', 'Expenditure/Expense'),
    ]
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='other_transactions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.title} - {self.amount}"
