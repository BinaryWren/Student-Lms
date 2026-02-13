from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Problem, Language, CodeSubmission, TestCase
from .serializers import ProblemSerializer, LanguageSerializer, CodeSubmissionSerializer
from .services import run_code_on_judge0, execute_code_piston

class CodeExecutionView(views.APIView):
    """
    General purpose code execution for the playground compiler.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        language = request.data.get('language')
        code = request.data.get('code')
        stdin = request.data.get('stdin', '')
        
        if not language or not code:
            return Response({"error": "Language and code are required."}, status=400)
            
        result = execute_code_piston(language, code, stdin)
        # Simplify response for frontend? Or just return raw Piston
        # Piston return format: { "run": { "stdout": "...", "stderr": "...", "code": 0, "signal": null, "output": "..." } }
        # Let's return the raw result or slightly wrapped
        return Response(result)
from academics.views import BaseInstituteViewSet # Reuse institute filtering

class ProblemViewSet(BaseInstituteViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """
        Run code against sample test cases only. 
        """
        problem = self.get_object()
        source_code = request.data.get('source_code')
        language_id = request.data.get('language_id') # Judge0 ID
        
        # Get sample cases
        samples = problem.test_cases.filter(is_hidden=False)
        results = []
        
        for case in samples:
            res = run_code_on_judge0(
                source_code, 
                language_id, 
                case.input_data, 
                case.expected_output,
                problem.time_limit_seconds
            )
            # Parse result
            passed = res.get('status', {}).get('id') == 3 # 3 is Accepted
            results.append({
                'input': case.input_data,
                'expected': case.expected_output,
                'status': res.get('status', {}).get('description'),
                'passed': passed
            })
            
        return Response({'results': results})

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Run against ALL test cases and save submission.
        """
        problem = self.get_object()
        source_code = request.data.get('source_code')
        lang_obj_id = request.data.get('language_pk') # Internal DB ID of Language model
        language = Language.objects.get(pk=lang_obj_id)
        
        # Create Submission Record
        submission = CodeSubmission.objects.create(
            problem=problem,
            student=request.user,
            language=language,
            source_code=source_code,
            status='PENDING'
        )
        
        # Run Tests
        all_cases = problem.test_cases.all()
        total_cases = all_cases.count()
        passed_cases = 0
        final_status = 'ACCEPTED'
        
        for case in all_cases:
            res = run_code_on_judge0(
                source_code, 
                language.judge0_id, 
                case.input_data, 
                case.expected_output,
                problem.time_limit_seconds
            )
            status_id = res.get('status', {}).get('id')
            
            if status_id != 3: # Not Accepted
                final_status = res.get('status', {}).get('description').upper().replace(' ', '_')
                break # Stop on first fail? or continue? Usually strict grading stops or counts. 
                # Let's count for partial score?
            else:
                passed_cases += 1

        # Calculate Score
        # If any failed, status is that failure (e.g. WRONG_ANSWER)
        # If all passed, ACCEPTED.
        # Score = (Passed / Total) * 100 for simplicity? Or sum of points.
        
        if passed_cases == total_cases:
            final_status = 'ACCEPTED'
            submission.score = 100
        else:
            # If not accepted, score is 0? or partial?
            # Let's say 0 for strict ACM style, or partial.
            # Let's do partial.
            if total_cases > 0:
                submission.score = int((passed_cases / total_cases) * 100)
            if final_status == 'ACCEPTED': final_status = 'WRONG_ANSWER' # Should catch logic above
            
        submission.status = final_status
        submission.save()
        
        return Response(CodeSubmissionSerializer(submission).data)

class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Language.objects.filter(is_active=True)
    serializer_class = LanguageSerializer
    permission_classes = [IsAuthenticated]

class CodeSubmissionViewSet(BaseInstituteViewSet):
    queryset = CodeSubmission.objects.all()
    serializer_class = CodeSubmissionSerializer
    # BaseInstituteViewSet should handle student filtering automatically via get_queryset override 
    # if we add CodeSubmission to its logic. 
    # I need to update BaseInstituteViewSet in academics/views.py first or override here.
    # Override here is safer to avoid cross-app spaghetti editing.
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return CodeSubmission.objects.filter(student=user)
        # Institutes
        return CodeSubmission.objects.filter(problem__institute=user.institute)
