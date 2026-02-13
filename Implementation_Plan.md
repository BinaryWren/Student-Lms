# Mission 0: Implementation Plan & UI Spec

## 1. Overview
This document outlines the implementation plan and UI specification for the **Multi-Institute LMS Platform**. The goal is to build a scalable, aesthetically premium, and highly functional Learning Management System using **Next.js 15**, **Tailwind CSS 4**, and **shadcn/ui**.

## 2. Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4 (with `oklch` colors for richness) + Tailwind Animate
- **Components:** shadcn/ui (Radix Primitives)
- **Icons:** Lucide React
- **Fonts:** Outfit (Headings), Inter (Body)
- **Theme:** Rich Violet/Indigo (Premium Look)

## 3. Design System & Theming
### Tokens
- **Colors:**
  - Primary: Vibrant Violet (`oklch(0.55 0.25 265)`)
  - Background: Off-white / Deep Slate for Dark Mode
  - Border Radius: `0.75rem` (Softer, modern feel)
- **Typography:**
  - `Outfit` for modern, geometric headers.
  - `Inter` for highly readable body text.

### Interactive Components
- **Sidebar:** collapsible, institute-aware, supports "inset" and "floating" variants.
- **Cards:** Glassmorphism effects, hover lifts, subtle borders.
- **Micro-interactions:** Hover states on buttons, cards, and list items.

## 4. Page Map & Implementation Status

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| **Landing** | `/` | ✅ Done | Feature map, quick links, gradient hero. |
| **Design System** | `/design/components` | ✅ Done | Inventory of all base components (Buttons, Inputs, Dialogs, etc.). |
| **Institute Dashboard** | `/institutes/[id]/dashboard` | ✅ Done | Admin view with stats, charts placeholder, recent activity. |
| **Course List** | `/institutes/[id]/courses` | ✅ Done | Grid of courses with filters and management actions. |
| **Course Builder** | `/institutes/[id]/courses/create` | ✅ Done | Complex form with module management (drag-n-drop UI). |
| **Student Portal** | `/student/dashboard` | ✅ Done | Learner-centric view with progress tracking and assignments. |
| **Attendance & Readmission** | `/instructor/attendance`, `/student/courses/[id]` | ✅ Done | Daily attendance, lockout logic (4 days), and readmission workflow (Admin vs Instructor). |
| **Assessment System** | `/instructor/assessments`, `/student/quizzes` | ✅ Done | Quizzes, Assignments, Question Banks, and Grading. |
| **Documents Gallery** | `/institutes/[id]/gallery`, `/student/gallery` | ✅ Done | PDF/Link sharing for Reference Materials. |
| **Institute Settings** | `/institutes/[id]/settings/general` | ✅ Done | Update institute name, email, website, and theme. |
| **Online/Offline Student Mgmt** | `/register`, `/institutes/[id]/admissions` | ✅ Done | Segregated flows for Online vs Offline students, email-based login for Online. |
| **AI Tutor Chatbot** | `Global Student Dashboard` | ✅ Done | Gemini-powered AI assistant for every student, available throughout the course. |

## 5. Multi-Institute Architecture (Spec)
To support multi-tenancy:
1.  **Institute Context:** The `[id]` parameter in routes serves as the key.
2.  **Theming:** CSS Variables (`--primary`, `--sidebar-bg`) can be dynamically injected based on the Institute ID fetched from the backend.
3.  **Data Isolation:** 
    - **Frontend:** The `api` client (Axios interceptor) automatically extracts institute ID from the URL and injects it into the `X-Institute-ID` header.
    - **Backend:** `get_active_institute()` utility extracts this header. `BaseInstituteViewSet` uses this context to automatically scope all academic data (Programs, Batches, Courses, Students).
    - **User Isolation:** Users are strictly linked to a single institute. Cross-institute access is blocked unless Super Admin.
    - **Login Separation:** Online students log in via **Email**, while Offline students use **Student ID**.
4. **Dynamic Sidebar:** `AppSidebar` fetches all institutes for SuperAdmins and a specific one for others, supporting real-time switching via `TeamSwitcher`.
5. **Smart Credentials:** Automated logic generates `ONL-` IDs for online students and ensures `User` accounts are created immediately upon admission approval, bypassing batch constraints.

## 6. Next Steps (Mission 1+)
- [x] Connect `TeamSwitcher` to real backend data.
- [x] Implement robust Authentication (basic role-based access implemented).
- [ ] Make the "Course Builder" fully functional with rich text editor integration.
- [ ] Implement the interactive "Student Portal" features (actually taking a quiz).

---
*Created by Antigravity Agent*
