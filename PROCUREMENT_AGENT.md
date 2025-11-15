# Procurement Agent - Employee Task Analysis

## Overview
The Procurement Agent analyzes employee task completion and availability to help admins make informed decisions about task assignments. It provides insights into which employees have completed tasks and are available for new work.

## Features

### 1. **Employee Availability Analysis**
- Identifies employees with completed tasks
- Tracks active task load per employee
- Calculates availability scores
- Provides workload recommendations

### 2. **Task Completion Tracking**
- Monitors task completion rates
- Identifies top performers
- Tracks overdue tasks
- Analyzes productivity patterns

### 3. **Smart Recommendations**
- Suggests optimal task assignments
- Identifies overloaded employees
- Recommends workload balancing
- Highlights high performers

## API Endpoints

Base path: `/api/procurement`

### Authentication
All endpoints require admin authentication:
- JWT token in Authorization header
- Admin role verification

### Core Operations

**Run Procurement Analysis**
```
POST /api/procurement/run-analysis
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Procurement analysis completed successfully",
  "data": {
    "totalEmployees": 10,
    "availableEmployees": [
      {
        "employeeId": "emp1",
        "name": "John Doe",
        "email": "john@company.com",
        "department": "dept_id",
        "totalTasks": 15,
        "completedTasks": 12,
        "activeTasks": 1,
        "overdueTasks": 0,
        "completionRate": 80,
        "isAvailable": true,
        "availabilityScore": 85
      }
    ],
    "busyEmployees": [...],
    "allEmployees": [...]
  }
}
```

**Generate Full Report**
```
GET /api/procurement/report
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "report": {
    "timestamp": "2025-01-01T10:00:00Z",
    "summary": {
      "totalEmployees": 10,
      "availableEmployees": 6,
      "busyEmployees": 4,
      "availabilityRate": 60
    },
    "topPerformers": [...],
    "availableEmployees": [...],
    "recommendations": [
      {
        "type": "task_assignment",
        "message": "6 employees are available for new task assignments",
        "priority": "high",
        "employees": ["John Doe", "Jane Smith", "Bob Wilson"]
      }
    ]
  }
}
```

**Get Available Employees**
```
GET /api/procurement/available-employees?minScore=50
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "availableEmployees": [
    {
      "employeeId": "emp1",
      "name": "John Doe",
      "email": "john@company.com",
      "department": "dept_id",
      "availabilityScore": 85,
      "activeTasks": 1,
      "completionRate": 80
    }
  ],
  "count": 6
}
```

**Get Top Performers**
```
GET /api/procurement/top-performers?limit=5
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "topPerformers": [
    {
      "employeeId": "emp1",
      "name": "John Doe",
      "email": "john@company.com",
      "completionRate": 95,
      "availabilityScore": 90,
      "totalTasks": 20
    }
  ]
}
```

**Get Employee Statistics**
```
GET /api/procurement/employee-stats/:employeeId
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "employeeId": "emp1",
  "stats": {
    "totalTasks": 15,
    "completedTasks": 12,
    "activeTasks": 1,
    "overdueTasks": 0,
    "upcomingTasks": 1,
    "completionRate": 80,
    "isAvailable": true,
    "availabilityScore": 85
  }
}
```

## Availability Scoring System

### Availability Criteria
- **Available**: Less than 2 active tasks
- **Busy**: 2 or more active tasks

### Availability Score Calculation
```javascript
Base Score: 100
- Active Tasks: -25 points each
- Overdue Tasks: -40 points each
- High Completion Rate (>80%): +10 points
Final Score: 0-100 (higher is better)
```

### Score Interpretation
- **90-100**: Highly available, excellent performer
- **70-89**: Available, good performer
- **50-69**: Moderately available
- **30-49**: Limited availability
- **0-29**: Not available, overloaded

## Usage Examples

### 1. Daily Task Assignment Check
```bash
# Check which employees are available for new tasks
curl -X GET "http://localhost:5000/api/procurement/available-employees" \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Weekly Performance Review
```bash
# Get comprehensive report for team review
curl -X GET "http://localhost:5000/api/procurement/report" \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Task Assignment Decision
```bash
# Run analysis before assigning critical tasks
curl -X POST "http://localhost:5000/api/procurement/run-analysis" \
  -H "Authorization: Bearer <admin_token>"
```

## Integration with Task Management

### Automatic Analysis Triggers
The procurement agent can be integrated with existing task workflows:

```javascript
// When creating new tasks, check availability first
const availableEmployees = await procurementAgent.getAvailableEmployees(70);

// Suggest best candidates for task assignment
const topPerformers = await procurementAgent.getTopPerformers(3);

// Monitor workload balance
const analysis = await procurementAgent.analyzeEmployeeAvailability(adminId);
```

### Dashboard Integration
- **Real-time Availability**: Show available employees count
- **Performance Metrics**: Display completion rates and scores
- **Workload Alerts**: Notify about overloaded employees
- **Assignment Suggestions**: Recommend optimal task assignments

## Recommendations System

### Recommendation Types

1. **Task Assignment**
   - Identifies employees ready for new tasks
   - Priority: High
   - Action: Assign new tasks to available employees

2. **Priority Assignment**
   - Highlights high-performing available employees
   - Priority: Medium
   - Action: Assign critical/priority tasks to top performers

3. **Workload Balance**
   - Identifies overloaded employees
   - Priority: High
   - Action: Redistribute tasks or provide support

### Smart Assignment Logic
```javascript
// Example: Assign task to best available employee
const availableEmployees = await procurementAgent.getAvailableEmployees(60);
const bestCandidate = availableEmployees[0]; // Highest availability score

// Create task assignment
const newTask = await Task.create({
  title: "New Project Task",
  assignee: bestCandidate.employeeId,
  // ... other task details
});
```

## Performance Benefits

### For Admins
- **Data-Driven Decisions**: Make informed task assignments
- **Workload Visibility**: See team capacity at a glance
- **Performance Tracking**: Monitor employee productivity
- **Bottleneck Identification**: Spot overloaded team members

### For Teams
- **Balanced Workload**: Prevent employee burnout
- **Optimal Utilization**: Maximize team productivity
- **Fair Distribution**: Ensure equitable task assignment
- **Performance Recognition**: Highlight top performers

## Monitoring and Audit

### Audit Logging
All procurement operations are logged via the compliance system:
- Analysis requests and results
- Report generation activities
- Employee availability queries
- Performance metric calculations

### Performance Metrics
- Analysis response time
- Employee availability trends
- Task completion patterns
- Workload distribution efficiency

## Future Enhancements

### Planned Features
1. **Predictive Analytics**: Forecast employee availability
2. **Skill-Based Matching**: Match tasks to employee skills
3. **Automated Assignment**: Auto-assign tasks based on availability
4. **Performance Trends**: Historical performance analysis
5. **Team Optimization**: Department-level workload balancing

### Integration Opportunities
- **Calendar Integration**: Consider employee schedules
- **Skills Database**: Match tasks to employee expertise
- **Project Management**: Integrate with project timelines
- **HR Systems**: Connect with employee data systems

This procurement agent provides comprehensive insights for optimal task assignment and team management.