from django.core.management.base import BaseCommand
from core.models import Institute
from codelab.models import Language, Problem, TestCase

class Command(BaseCommand):
    help = 'Seeds CodeLab data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding CodeLab data...")
        
        # 1. Languages (Mock Judge0 IDs)
        Language.objects.get_or_create(name="Python (3.8.1)", judge0_id=71)
        Language.objects.get_or_create(name="JavaScript (Node.js 12.14.0)", judge0_id=63)
        Language.objects.get_or_create(name="C++ (GCC 9.2.0)", judge0_id=54)

        # 2. Problem
        try:
            ecs = Institute.objects.get(name="ECS")
            prob1, _ = Problem.objects.get_or_create(
                institute=ecs,
                title="Sum of Two Numbers",
                defaults={
                    'description': "Write a program that takes two integers as input and prints their sum.\n\n**Input Format**\nTwo integers separated by newline.\n\n**Output Format**\nA single integer.\n\n**Sample Input**\n2\n3\n\n**Sample Output**\n5",
                    'difficulty': 'EASY',
                    'time_limit_seconds': 1.0,
                    'memory_limit_kb': 128000
                }
            )
            
            # 3. Test Cases for Problem 1
            # Sample (Visible)
            TestCase.objects.get_or_create(
                problem=prob1,
                input_data="3\n4",
                expected_output="7",
                points=0,
                is_hidden=False
            )
            # Hidden
            TestCase.objects.get_or_create(
                problem=prob1,
                input_data="10\n20",
                expected_output="30",
                points=10,
                is_hidden=True
            )
            TestCase.objects.get_or_create(
                problem=prob1,
                input_data="-5\n5",
                expected_output="0",
                points=10,
                is_hidden=True
            )

        except Institute.DoesNotExist:
            self.stdout.write("Institute ECS not found, skipping problem seeding.")

        self.stdout.write(self.style.SUCCESS('CodeLab seeded!'))
