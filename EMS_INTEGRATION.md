# Rishabh's EMS Automation Integration

## Overview
This document describes the integration of Rishabh's EMS (Email Management System) automation feature into the Complete Infiverse project, enabling admin users to send automated emails to employees regarding tasks.

## Integration Details

### Components Added

1. **Models**
   - `EmailTemplate.js` - Reusable email templates
   - `ScheduledEmail.js` - Scheduled email management

2. **Services**
   - `emsAutomation.js` - Core EMS automation service

3. **Routes**
   - `ems.js` - RESTful API endpoints for email operations

### Features

#### 1. **Task-Related Email Automation**
- **Task Assignment Notifications** - Automatic emails when tasks are assigned
- **Task Reminders** - Scheduled reminders for upcoming due dates
- **Overdue Alerts** - Automatic alerts for overdue tasks
- **Bulk Email Operations** - Send emails to multiple employees at once

#### 2. **Email Templates**
- **Pre-built Templates** for common scenarios
- **Custom Templates** for specific needs
- **Template Variables** for dynamic content
- **HTML Email Support** with professional styling

#### 3. **Scheduled Email System**
- **Schedule Emails** for future delivery
- **Automatic Processing** every 5 minutes
- **Email Status Tracking** (scheduled, sent, failed, cancelled)
- **Manual Processing** trigger for admins

### API Endpoints

Base path: `/api/ems`

#### Authentication
All endpoints require admin authentication:
- JWT token in Authorization header
- Admin role verification

#### Email Operations

**Send Task Assignment Email**
```
POST /api/ems/send-task-assignment
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "taskId": "task_id_here",
  "assigneeId": "employee_id_here"
}
```

**Send Task Reminders**
```
POST /api/ems/send-task-reminders
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "taskIds": ["task1", "task2", "task3"],
  "reminderType": "due_soon"
}
```

**Send Overdue Alerts**
```
POST /api/ems/send-overdue-alerts
Authorization: Bearer <admin_token>
```

**Send Custom Email**
```
POST /api/ems/send-custom-email
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "recipients": ["employee1@company.com", "employee2@company.com"],
  "subject": "Important Announcement",
  "htmlBody": "<h2>Hello Team</h2><p>This is an important message...</p>",
  "scheduleTime": "2025-01-15T10:00:00Z" // Optional
}
```

**Send Bulk Task Emails**
```
POST /api/ems/send-bulk-task-emails
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "taskIds": ["task1", "task2", "task3"],
  "templateId": "task_reminder"
}
```

#### Template Management

**Get Email Templates**
```
GET /api/ems/templates
Authorization: Bearer <token>
```

#### Scheduled Email Management

**Get Scheduled Emails**
```
GET /api/ems/scheduled-emails?status=scheduled&limit=50
Authorization: Bearer <admin_token>
```

**Cancel Scheduled Email**
```
DELETE /api/ems/scheduled-emails/:id
Authorization: Bearer <admin_token>
```

**Process Scheduled Emails (Manual)**
```
POST /api/ems/process-scheduled
Authorization: Bearer <admin_token>
```

#### Task Queries for Email

**Get Tasks for Email Operations**
```
GET /api/ems/tasks-for-email?type=overdue
Authorization: Bearer <admin_token>

Types: all, pending, overdue, due_soon
```

### Email Templates

#### Built-in Templates

1. **Task Assignment** (`task_assignment`)
   - Subject: "📋 New Task Assigned: {task_title}"
   - Variables: employee_name, task_title, task_description, task_priority, due_date, assigned_by

2. **Task Reminder** (`task_reminder`)
   - Subject: "⏰ Task Reminder: {task_title}"
   - Variables: employee_name, task_title, due_date, task_status, task_progress

3. **Task Overdue** (`task_overdue`)
   - Subject: "🚨 Overdue Task: {task_title}"
   - Variables: employee_name, task_title, due_date, days_overdue, task_status

#### Template Variables
Templates support dynamic variables using `{variable_name}` syntax:
- `{employee_name}` - Employee's full name
- `{task_title}` - Task title
- `{task_description}` - Task description
- `{task_priority}` - Task priority (Low, Medium, High)
- `{due_date}` - Formatted due date
- `{task_status}` - Current task status
- `{task_progress}` - Task completion percentage
- `{assigned_by}` - Name of person who assigned the task
- `{days_overdue}` - Number of days past due date

### Environment Configuration

```env
# Email Configuration (Required for EMS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password
```

### Automated Jobs

#### Scheduled Email Processing
- **Frequency**: Every 5 minutes
- **Function**: Processes emails scheduled for delivery
- **Status Updates**: Automatically updates email status (sent/failed)

#### Integration with Existing Jobs
- Works alongside existing auto-end day job
- Minimal performance impact
- Error handling and logging included

### Usage Examples

#### 1. Send Task Assignment Email
```javascript
// When a task is assigned in the existing task system
const taskId = "new_task_id";
const assigneeId = "employee_id";
const adminId = "admin_id";

// This can be integrated into existing task assignment logic
await emsAutomation.sendTaskAssignmentEmail(taskId, assigneeId, adminId);
```

#### 2. Daily Overdue Task Alerts
```javascript
// Can be added to a daily cron job
const overdueTasks = await Task.find({
  dueDate: { $lt: new Date() },
  status: { $ne: 'Completed' }
});

for (const task of overdueTasks) {
  await emsAutomation.sendTaskOverdueEmail(task._id);
}
```

#### 3. Weekly Task Reminders
```javascript
// Send reminders for tasks due in the next 3 days
const upcomingTasks = await Task.find({
  dueDate: { 
    $gte: new Date(),
    $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  status: { $ne: 'Completed' }
});

for (const task of upcomingTasks) {
  await emsAutomation.sendTaskReminderEmail(task._id);
}
```

### Integration Points

#### 1. Task Management System
- Automatic emails when tasks are created/assigned
- Reminder emails based on due dates
- Overdue notifications

#### 2. Admin Dashboard
- Bulk email operations
- Email template management
- Scheduled email monitoring

#### 3. Employee Notifications
- Task-related updates
- System announcements
- Custom communications

### Security Features

1. **Admin-Only Access** - All email operations require admin privileges
2. **Audit Logging** - All email activities are logged via compliance system
3. **Input Validation** - Comprehensive validation of email content and recipients
4. **Rate Limiting** - Built-in protection against email spam
5. **Template Security** - Controlled template system prevents malicious content

### Testing

#### Test Email Configuration
```bash
# Test basic email sending
curl -X POST "http://localhost:5000/api/ems/send-custom-email" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test@example.com"],
    "subject": "Test Email",
    "htmlBody": "<h2>Test</h2><p>This is a test email.</p>"
  }'
```

#### Test Template System
```bash
# Get available templates
curl -X GET "http://localhost:5000/api/ems/templates" \
  -H "Authorization: Bearer <token>"
```

### Performance Considerations

1. **Batch Processing** - Scheduled emails are processed in batches
2. **Error Handling** - Failed emails don't block other operations
3. **Database Indexing** - Optimized queries for scheduled emails
4. **Memory Management** - Efficient template rendering and email processing

### Monitoring and Logging

1. **Email Status Tracking** - Complete audit trail of all email operations
2. **Error Logging** - Detailed error messages for troubleshooting
3. **Performance Metrics** - Processing time and success rates
4. **Compliance Integration** - All activities logged via compliance audit system

## Credits

Original EMS automation system developed by **Rishabh**.
Repository: https://github.com/Parth232004/Rishabh.git

Integrated into Complete Infiverse by adapting Python FastAPI code to Node.js/Express with MongoDB storage and enhanced admin functionality.