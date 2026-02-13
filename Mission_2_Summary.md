# Mission 2: Smart Notification System

Successfully implemented a robust notification system with in-app alerts and customizable preferences.

## Key Features
1.  **Notification Engine**:
    *   Backend app `notifications`.
    *   `Notification` model supports multiple types (Info, Warning, Success, Error).
    *   `NotificationPreference` model allows users to toggle specific alerts.

2.  **Smart Triggers (Background Job)**:
    *   `python manage.py run_reminders`
    *   **Assignments**: Warns 24 hours before deadlines.
    *   **Quizzes**: Alerts 1 hour before exams.
    *   **Availability**: Notifies when new certificates are issued.
    *   **Engagement**: Sends "We Miss You" prompts after 7 days of inactivity.
    *   **Throttling**: Prevents spam (e.g., max 1 inactivity alert per week).

3.  **Frontend Integration**:
    *   **Notification Bell**: Real-time polling (1 min interval) in Student Header.
    *   **Popover UI**: Quick view of unread alerts with "Mark as Read" functionality.
    *   **Notifications Page**: Full history view at `/student/notifications`.

4.  **User Preferences**:
    *   Dedicated "Preferences" tab in the Notifications page.
    *   Toggle Email vs In-App channels.
    *   Enable/Disable specific trigger types.

## API Endpoints
*   `GET /api/notifications/` - List user notifications.
*   `POST /api/notifications/{id}/mark_read/` - Mark specific item read.
*   `POST /api/notifications/mark_all_read/` - Clear all unread.
*   `GET/PATCH /api/notifications/preferences/` - Manage user settings.

## How to Test
1.  **Trigger**: Run `python manage.py run_reminders` in the backend.
2.  **View**: Login as a student and check the Bell icon in the header.
3.  **Manage**: Go to `/student/notifications` to see history and change settings.
