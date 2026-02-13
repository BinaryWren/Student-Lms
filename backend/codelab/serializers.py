from rest_framework import serializers
from .models import Language, Problem, TestCase, CodeSubmission

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class TestCaseSerializer(serializers.ModelSerializer):
    # Only expose input/output if the test case is not hidden, or if we are admin?
    # For now, let's assume we don't send test case details to student except Sample ones.
    # We will filter in the View.
    class Meta:
        model = TestCase
        fields = '__all__'

class ProblemSerializer(serializers.ModelSerializer):
    # Retrieve only sample test cases for listing/detail
    sample_test_cases = serializers.SerializerMethodField()
    
    class Meta:
        model = Problem
        fields = '__all__'

    def get_sample_test_cases(self, obj):
        # Return only hidden=False cases
        samples = obj.test_cases.filter(is_hidden=False)
        return TestCaseSerializer(samples, many=True).data

class CodeSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    language_name = serializers.ReadOnlyField(source='language.name')
    
    class Meta:
        model = CodeSubmission
        fields = '__all__'
        read_only_fields = ['status', 'score', 'execution_time', 'memory_used', 'submitted_at', 'judge0_token']
