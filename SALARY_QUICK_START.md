# Biometric Salary Management - Quick Start Guide

## 📋 What's Been Implemented

### Backend (Server)
✅ **Models**:
- `SalaryRecord.js` - Stores calculated salary data
- `Holiday.js` - Manages holidays for exclusion
- Updated `User.js` with `employeeId` and `hourlyRate` fields

✅ **Controller** (`salaryController.js`):
- File upload handler with multer
- Excel/CSV parsing with xlsx
- Automatic salary calculation
- Holiday exclusion logic
- Hourly rate updates
- Statistics calculation

✅ **Routes** (`salaryRoutes.js`):
- POST `/api/salary/upload` - Upload biometric data
- GET `/api/salary/:month` - Get salary records
- PUT `/api/salary/:id/rate` - Update hourly rate  
- DELETE `/api/salary/:id` - Delete record
- GET `/api/salary/stats/:month` - Get statistics
- GET `/api/salary/holidays` - Get holidays
- POST `/api/salary/holidays` - Add holiday
- DELETE `/api/salary/holidays/:id` - Delete holiday

### Frontend (Client)
✅ **BiometricSalaryManagement Page**:
- File upload interface
- Monthly salary records table
- Inline hourly rate editing
- Holiday management
- Statistics dashboard
- Excel export functionality

✅ **API Service** (`salaryAPI.js`):
- Centralized API calls
- Error handling
- Auth token management

### Dependencies
✅ Installed:
- Server: `multer`, `xlsx` (already installed)
- Client: `xlsx` (newly installed)

## 🚀 How to Use

### 1. Prepare Your Data
Create an Excel file with these columns:
```
Employee ID | Name | Date | Punch In | Punch Out
EMP001 | John Doe | 2025-11-01 | 09:00 | 17:30
EMP001 | John Doe | 2025-11-02 | 09:15 | 17:45
```

### 2. Set Employee Hourly Rates
Update users in your database with:
```javascript
{
  employeeId: "EMP001",
  hourlyRate: 30  // $30 per hour
}
```

Default hourly rate is $25/hour if not set.

### 3. Upload Attendance Data
1. Navigate to `/biometric-salary-management`
2. Select month
3. Upload Excel/CSV file
4. System automatically calculates salaries

### 4. Manage Holidays
1. Go to Holidays tab
2. Add holidays (e.g., "2025-11-25", "Thanksgiving")
3. These days will be excluded from salary calculations

### 5. Review & Export
1. View calculated records in Records tab
2. Edit hourly rates inline if needed
3. Export to Excel for payroll processing

## 📁 File Structure

```
server/
├── models/
│   ├── SalaryRecord.js (NEW)
│   ├── Holiday.js (NEW)
│   └── User.js (UPDATED - added employeeId, hourlyRate)
├── controllers/
│   └── salaryController.js (NEW)
├── routes/
│   └── salaryRoutes.js (NEW)
└── uploads/salary/ (NEW - auto-created)

client/src/
├── pages/
│   └── BiometricSalaryManagement.jsx (NEW)
└── services/
    └── salaryAPI.js (NEW)
```

## 🔗 Integration with Existing App

### Add to Router
In your React router configuration, add:
```jsx
import BiometricSalaryManagement from './pages/BiometricSalaryManagement';

// In your routes:
<Route path="/biometric-salary-management" element={<BiometricSalaryManagement />} />
```

### Add to Navigation Menu
```jsx
<Link to="/biometric-salary-management">
  <DollarSign className="w-4 h-4" />
  Salary Management
</Link>
```

## 🧪 Testing

### Test Upload
1. Create a test Excel file with sample data
2. Upload through the UI
3. Verify salary records are created correctly

### Test Holiday Exclusion
1. Add a holiday for a specific date
2. Re-upload attendance file with that date
3. Verify those hours are excluded

### Test Rate Updates
1. Click edit icon on hourly rate
2. Change value
3. Verify total salary recalculates

## 📊 Sample Excel Template

| Employee ID | Name | Date | Punch In | Punch Out |
|-------------|------|------|----------|-----------|
| EMP001 | John Doe | 2025-11-01 | 09:00 | 17:30 |
| EMP001 | John Doe | 2025-11-04 | 09:15 | 17:45 |
| EMP002 | Jane Smith | 2025-11-01 | 08:45 | 17:00 |
| EMP002 | Jane Smith | 2025-11-04 | 08:50 | 17:15 |

## ⚙️ Configuration

### Default Hourly Rate
Change in `server/controllers/salaryController.js`:
```javascript
const DEFAULT_HOURLY_RATE = 25; // Change this value
```

### File Size Limit
Change in `server/controllers/salaryController.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB - change this
}
```

### Supported File Types
Modify in `server/controllers/salaryController.js`:
```javascript
const allowedExtensions = ['.xlsx', '.xls', '.csv'];
```

## 🔒 Security

- ✅ Authentication required for all endpoints
- ✅ Admin-only for upload, delete, and rate updates
- ✅ File type validation
- ✅ File size limits
- ✅ Automatic file cleanup after processing
- ✅ XSS protection through React
- ✅ SQL injection protection through Mongoose

## 🐛 Common Issues

### "No data found in file"
- Check Excel file has data rows, not just headers
- Verify column names match expected format

### "Failed to fetch salary records"
- Check if server is running
- Verify API endpoint is accessible
- Check browser console for errors

### Hours showing as 0
- Verify time format (HH:MM or HH:MM AM/PM)
- Check if date is marked as holiday

### Employee not found / Default rate used
- Add `employeeId` to User records
- Set `hourlyRate` field for each user

## 📝 Next Steps

1. **Update existing users** with employeeId and hourlyRate fields
2. **Add navigation link** to access the new page
3. **Test with real data** from your biometric system
4. **Configure holidays** for your organization
5. **Train admins** on the upload process

## 📚 Full Documentation

See `BIOMETRIC_SALARY_MANAGEMENT.md` for complete documentation including:
- Detailed API reference
- Database schema explanations
- Advanced features
- Troubleshooting guide
- Future enhancements

---

**Status**: ✅ Fully implemented and ready to use  
**Created**: November 2025  
**Dependencies**: All installed
