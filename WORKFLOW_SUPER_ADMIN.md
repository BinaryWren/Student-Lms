# Super Admin Workflows

The Super Admin is the architect and guardian of the multi-tenant LMS ecosystem. Their primary focus is on system-wide health, tenant (institute) management, and global configuration.

## 1. System Initialization & Configuration
**Goal:** Ensure the LMS platform is running, secure, and configured with global parameters.
- **W1.1 Initial Deployment**:
    1.  Deploy frontend (Next.js) and backend (Django) specific versions.
    2.  Run migration scripts to set up the core database schema.
    3.  Create the first Super Admin account via CLI (`createsuperuser`).
- **W1.2 Global Settings**:
    1.  Configure SMTP (Email) gateways for system-wide alerts.
    2.  Set up storage backends (AWS S3/Google Cloud) for global assets.
    3.  Define global security policies (password complexity, session timeouts).

## 2. Institute Management (Multi-Tenancy)
**Goal:** Onboard and manage client institutes (tenants).
- **W2.1 Onboarding & Switching Institutes**:
    1.  **Direct Creation**: Use the **"+" (Add Institute)** button in the sidebar's Institute Switcher.
    2.  **Input Data**: Provide the Institute Name in the dialog; system generates the slug and organization association automatically.
    3.  **Instant Switch**: Upon creation, the sidebar refreshes, and the UI redirects to the new institute's dashboard.
    4.  **Multi-Tenancy**: Use the Institute Switcher (Dropdown) to jump between different institutes. Data (Students, Courses) is isolated per institute context.
    5.  **Admin Provisioning**: Navigate to "Instructors" or "Users" within the new institute context to create the local "Institute Admin".
- **W2.2 Institute Configuration**:
    1.  Manage specific feature flags (e.g., Enable "CodeLab" for Tech Institutes).
    2.  Monitor storage and bandwidth usage per institute.
    3.  Suspend/Deactivate institutes for non-payment or policy violations.

## 3. Global User & Role Oversight
**Goal:** Manage system-wide access and troubleshoot high-level user issues.
- **W3.1 Global User Search**:
    1.  Search for any user across all institutes by email or username.
    2.  View user's institute association and role.
    3.  Perform administrative actions (Password Reset, Account Lock) in emergencies.
- **W3.2 Role Hierarchy Management**:
    1.  Define default permissions for standard roles (Admin, Instructor, Student).
    2.  Create custom global roles if necessary (e.g., "Auditor").

- **W3.3 Student Re-activation (Attendance)**:
    1.  View **Pending Re-activation Applications** forwarded by Instructors.
    2.  Review Instructor comments and student reasons.
    3.  **Approve/Reject**: 
        -   **Approve**: Student immediately regains dashboard access.
        -   **Reject**: Student remains inactive.

## 4. SaaS & Billing Management
**Goal:** Monetize the platform and manage subscriptions.
- **W4.1 Plan Management**:
    1.  Define Subscription Tiers (Free, Pro, Enterprise).
    2.  Set limits per tier (e.g., "Max 500 students", "10GB Storage").
- **W4.2 Billing Operations**:
    1.  View generated invoices for each institute.
    2.  Track payment status (Paid, Overdue).
    3.  Manually adjust credit or licenses.

## 5. System Health & Analytics
**Goal:** Monitor platform performance and usage trends.
- **W5.1 Infrastructure Monitoring**:
    1.  View dashboards for Server Load, API Latency, and Error Rates.
    2.  Check status of background workers (Celery/Redis) for tasks like video processing.
- **W5.2 Global Analytics**:
    1.  View total active users, total courses created, and storage metrics across the platform.
    2.  Generate monthly growth reports.
