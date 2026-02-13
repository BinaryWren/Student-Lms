# Ultra-Premium Multi-Institute LMS Platform

A state-of-the-art, multi-tenant Learning Management System built with **Next.js 15**, **Tailwind CSS 4**, and **Django REST Framework**.

## 🚀 Key Features

- **Multi-Tenancy (B2B SaaS)**: Support for multiple institutes under one platform.
- **Dynamic Institute Switcher**: Super Admins can manage several institutes and toggle between them seamlessly.
- **Data Isolation**: Strict separation of students, courses, and analytics per institute context.
- **Academic Ecosystem**: Programs -> Batches -> Courses -> Modules -> Lessons.
- **Interactive Learning**:
  - Live Classes with Zoom integration.
  - Documents Gallery for course-specific and general materials.
  - Automated Attendance with streak tracking and inactivity lock-out.
- **Rich Assessment Engine**: Quizzes (Pre-assessments, Exams), Assignments, and built-in Gradebook.
- **CodeLab**: Integrated coding environment with Piston execution (Python, C++, JS, Html) and standard input support.
- **AI Tutor**: Integrated Gemini-powered chatbot for 24/7 student assistance with context awareness.
- **Careers & Alumni**: Move graduated students to a public-facing Alumni Directory.

## 🛠 Technology Stack

- **Frontend**: Next.js 15 (App Router), shadcn/ui, Tailwind CSS 4, Lucide React, Axios.
- **Backend**: Django, Django REST Framework, JWT Authentication.
- **Infrastructure**: PostreSQL (Relational), Storage (S3/Local).

## 📖 Documentation

- [Implementation Plan](./Implementation_Plan.md)
- [Super Admin Workflows](./WORKFLOW_SUPER_ADMIN.md)
- [Institute Admin Workflows](./WORKFLOW_INSTITUTE_ADMIN.md)
- [Instructor Workflows](./WORKFLOW_INSTRUCTOR.md)
- [Student Workflows](./WORKFLOW_STUDENT.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostreSQL

### Development Setup
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```

3. **Login**:
   - Access the portal at `http://localhost:3000`.
   - Default Super Admin credentials (if seeded).

---
*Built with ❤️ by the Antigravity Team*
