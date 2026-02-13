from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from core.models import User, Institute, Organization
from academics.models import Program, Course, Batch

class TenantIsolationTests(APITestCase):
    def setUp(self):
        # Org
        self.org = Organization.objects.create(name="Test Org")

        # Institute A
        self.inst_a = Institute.objects.create(organization=self.org, name="Institute A")
        self.user_a = User.objects.create_user(username='user_a', password='password', institute=self.inst_a, role='INSTITUTE_ADMIN')
        
        # Institute B
        self.inst_b = Institute.objects.create(organization=self.org, name="Institute B")
        self.user_b = User.objects.create_user(username='user_b', password='password', institute=self.inst_b, role='INSTITUTE_ADMIN')

        # Data for A
        self.prog_a = Program.objects.create(institute=self.inst_a, name="Program A", code="PA")
        
        # Data for B
        self.prog_b = Program.objects.create(institute=self.inst_b, name="Program B", code="PB")

    def test_institute_a_cannot_see_b_data(self):
        client = APIClient()
        client.force_authenticate(user=self.user_a)
        
        url = reverse('program-list') # Assuming router name
        response = client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data]
        
        self.assertIn(self.prog_a.id, ids)
        self.assertNotIn(self.prog_b.id, ids)

    def test_institute_b_cannot_access_a_detail(self):
        client = APIClient()
        client.force_authenticate(user=self.user_b)
        
        url = reverse('program-detail', args=[self.prog_a.id])
        response = client.get(url)
        
        # Should be 404 because queryset filtering excludes it, so get_object fails
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_superuser_sees_all(self):
        super_user = User.objects.create_superuser(username='super', password='password')
        client = APIClient()
        client.force_authenticate(user=super_user)
        
        url = reverse('program-list')
        response = client.get(url)
        ids = [item['id'] for item in response.data]
        
        self.assertIn(self.prog_a.id, ids)
        self.assertIn(self.prog_b.id, ids)
