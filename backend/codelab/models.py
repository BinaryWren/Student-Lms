from django.db import models
from core.models import Institute, User
from academics.models import Course, Batch

class Language(models.Model):
    name = models.CharField(max_length=50) # e.g. "Python (3.8.1)"
    judge0_id = models.IntegerField(unique=True) # ID from Judge0
    is_active = models.BooleanField(default=True)

    def __str__(self): return self.name

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]
    
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='codelab_problems')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    description = models.TextField() # Markdown supported
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='EASY')
    
    # Constraints
    time_limit_seconds = models.FloatField(default=1.0)
    memory_limit_kb = models.IntegerField(default=128000)
    
    # Organization
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='problems')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='problems')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.title

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=True)
    points = models.IntegerField(default=10)

    def __str__(self): return f"Test Case for {self.problem.title}"

class CodeSubmission(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('WRONG_ANSWER', 'Wrong Answer'),
        ('TIME_LIMIT_EXCEEDED', 'Time Limit Exceeded'),
        ('COMPILATION_ERROR', 'Compilation Error'),
        ('RUNTIME_ERROR', 'Runtime Error'),
    ]

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='code_submissions')
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True)
    source_code = models.TextField()
    
    # Results
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    score = models.IntegerField(default=0)
    execution_time = models.FloatField(null=True) # seconds
    memory_used = models.IntegerField(null=True) # KB
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    judge0_token = models.CharField(max_length=100, blank=True, null=True) # To track async status if needed

    def __str__(self): return f"{self.student.username} - {self.problem.title} ({self.status})"
