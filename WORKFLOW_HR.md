# HR Management Workflow - LMS

This document outlines the responsibilities and workflows for HR Managers and Institute Administrators regarding staff management.

## 1. Staff Directory & Access Control
HR can manage the entire staff roster from the **HR Operations** dashboard.

- **Viewing Staff**: Access the "Staff Directory" tab to see all registered employees, their roles, and current leave balances.
- **Assigning Roles**:
    1. Click the **Auth** button next to an employee.
    2. Select the new role (e.g., INSTRUCTOR, HR, EMPLOYEE).
    3. Save to update their system permissions immediately.
- **Deactivating Staff**: (Coming Soon) Ability to suspend accounts for departing employees.

## 2. Attendance Management
The LMS allows HR to track daily presence for all employees.

- **Marking Attendance**:
    1. Navigate to the **Daily Attendance** tab.
    2. For each employee, select **Present** or **Absent**.
    3. The system captures the timestamp and marks the record for the current date.
- **Attendance History**: (Backend) Records are stored in the `EmployeeAttendance` model for monthly reporting.

## 3. Leave Management
HR is responsible for reviewing and processing leave applications.

- **Reviewing Requests**:
    1. Go to the **Leave Management** tab.
    2. Pending requests show the employee name, period, and reason.
- **Approval/Rejection**:
    - Click the **Check (Green)** icon to approve. This automatically:
        - Deducts the days from the employee's `remaining_leaves`.
        - Updates the status to APPROVED.
    - Click the **Reject (Red)** icon to deny. This:
        - Keeps the leave balance intact.
        - Updates the status to REJECTED.
- **Leave Quotas**: Employees are typically assigned a `monthly_leave_quota` (default: 2 days) which resets or accumulates based on institute policy.

## 4. Task Assignment
HR can assign professional tasks to any staff member.

- **Creating Tasks**:
    1. Click the **Task** button in the Staff Directory.
    2. Enter a Title and Description.
    3. The employee will see this task on their personal dashboard.

---
*Note: Institute Administrators have full access to these HR features in addition to standard institute management.*
