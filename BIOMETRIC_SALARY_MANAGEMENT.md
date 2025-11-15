# Biometric Salary Management System

## Overview
The Biometric Salary Management System is a comprehensive module for uploading biometric attendance data, calculating employee salaries based on worked hours, and managing holidays.

## Features
- ✅ Upload Excel/CSV files containing biometric attendance data
- ✅ Automatic salary calculation based on worked hours
- ✅ Holiday management with exclusion from salary calculations
- ✅ Inline hourly rate editing
- ✅ Export salary records to Excel
- ✅ Monthly salary statistics and analytics
- ✅ Status tracking (pending, approved, paid)

## Backend Components

### Models

#### 1. SalaryRecord Model (`server/models/SalaryRecord.js`)
Stores calculated salary information for employees.

**Schema Fields:**
- `employeeId` (String, required): Employee identifier
- `name` (String, required): Employee name
- `month` (String, required): Month in YYYY-MM format
- `totalHours` (Number): Total worked hours for the month
- `hourlyRate` (Number): Employee's hourly pay rate
- `totalSalary` (Number): Calculated total salary
- `holidaysExcluded` (Array): Dates excluded as holidays
- `dailyRecords` (Array): Daily attendance records
- `status` (String): Payment status (pending/approved/paid)
- `uploadDate` (Date): When the record was created

#### 2. Holiday Model (`server/models/Holiday.js`)
Stores holiday dates to exclude from salary calculations.

**Schema Fields:**
- `date` (String, required): Date in YYYY-MM-DD format
- `description` (String, required): Holiday description
- `type` (String): Holiday type (public/company/optional)
- `isRecurring` (Boolean): Whether it recurs yearly

### API Endpoints

All endpoints are prefixed with `/api/salary` and require authentication.

#### Upload & Calculate
**POST `/api/salary/upload`**
- Admin only
- Accepts Excel (.xlsx, .xls) or CSV files
- Parses attendance data and calculates salaries
- Request: Multipart form-data with 'file' field
- Response: Calculated salary records

#### Get Salary Records
**GET `/api/salary/:month`**
- Get all salary records for a specific month
- Param: `month` in YYYY-MM format (e.g., "2025-11")
- Response: Salary records with statistics

#### Update Hourly Rate
**PUT `/api/salary/:id/rate`**
- Admin only
- Update hourly rate for a salary record
- Body: `{ hourlyRate: number }`
- Response: Updated salary record with recalculated total

#### Delete Salary Record
**DELETE `/api/salary/:id`**
- Admin only
- Delete a specific salary record
- Response: Confirmation message

#### Get Statistics
**GET `/api/salary/stats/:month`**
- Get salary statistics for a month
- Response: Total employees, hours, salary, averages, status breakdown

#### Manage Holidays
**GET `/api/salary/holidays`**
- Get all holidays
- Query params: `month`, `year` (optional)
- Response: List of holidays

**POST `/api/salary/holidays`**
- Admin only
- Add or update a holiday
- Body: `{ date, description, type, isRecurring }`
- Response: Created/updated holiday

**DELETE `/api/salary/holidays/:id`**
- Admin only
- Delete a holiday
- Response: Confirmation message

## Frontend Components

### BiometricSalaryManagement Page (`client/src/pages/BiometricSalaryManagement.jsx`)

A comprehensive React component with three main tabs:

#### 1. Upload Tab
- File upload interface with drag-and-drop support
- Supports .xlsx, .xls, .csv formats
- Shows expected file format guidelines
- Real-time file validation
- Upload progress indicator

#### 2. Records Tab
- Table view of calculated salary records
- Columns: Employee ID, Name, Total Hours, Hourly Rate, Total Salary, Holidays, Status, Actions
- **Inline editing**: Click edit icon next to hourly rate to modify
- Auto-recalculation of total salary when rate changes
- Delete individual records
- Export to Excel functionality
- Empty state for no records

#### 3. Holidays Tab
- Add new holidays with date, description, and type
- View all holidays for selected month
- Delete holidays
- Holiday type selection (Public/Company/Optional)

### Features
- Month selector for viewing different periods
- Statistics cards showing:
  - Total employees
  - Total salary
  - Total hours
  - Average salary
- Success/Error notifications with auto-dismiss
- Loading states and empty states
- Responsive design

### Salary API Service (`client/src/services/salaryAPI.js`)

Centralized API service for all salary-related requests:
- `uploadBiometricFile(file)`: Upload attendance file
- `getSalaryByMonth(month)`: Fetch salary records
- `updateHourlyRate(id, hourlyRate)`: Update rate
- `deleteSalaryRecord(id)`: Delete record
- `getSalaryStats(month)`: Get statistics
- `getHolidays(params)`: Fetch holidays
- `manageHoliday(data)`: Add/update holiday
- `deleteHoliday(id)`: Delete holiday

## Expected File Format

The biometric attendance Excel/CSV file should contain these columns (column names are flexible):

| Column Name Options | Description | Example |
|---------------------|-------------|---------|
| Employee ID / EmployeeID / empId / ID | Unique employee identifier | EMP001 |
| Name / Employee Name / EmployeeName | Full name of employee | John Doe |
| Date / date / Attendance Date | Date of attendance | 2025-11-01 |
| Punch In / PunchIn / In Time / Check In | Clock-in time | 09:00 AM |
| Punch Out / PunchOut / Out Time / Check Out | Clock-out time | 05:30 PM |

### Sample Data:
```csv
Employee ID,Name,Date,Punch In,Punch Out
EMP001,John Doe,2025-11-01,09:00,17:30
EMP001,John Doe,2025-11-02,09:15,17:45
EMP002,Jane Smith,2025-11-01,08:45,17:00
```

## Salary Calculation Logic

1. **Parse File**: Extract attendance data from uploaded file
2. **Group by Employee**: Aggregate all records by Employee ID
3. **Calculate Daily Hours**: 
   - Parse punch in/out times
   - Calculate difference (handles next-day punch-out)
   - Format: `hours = punchOut - punchIn`
4. **Check Holidays**: Exclude days marked as holidays (0 hours counted)
5. **Sum Total Hours**: Add up all daily hours (excluding holidays)
6. **Fetch Hourly Rate**: Get rate from Employee collection
7. **Calculate Salary**: `totalSalary = totalHours × hourlyRate`
8. **Store Record**: Save to SalaryRecord collection

## Usage Instructions

### For Administrators

#### 1. Upload Biometric Data
1. Navigate to Biometric Salary Management page
2. Select the month you're processing
3. Click "Select File" and choose your Excel/CSV file
4. Review the expected format guidelines
5. Click "Upload & Calculate Salary"
6. Wait for processing to complete
7. View results in the Records tab

#### 2. Manage Holidays
1. Go to the Holidays tab
2. Enter date, description, and type
3. Click "Add Holiday"
4. Holidays are automatically excluded from salary calculations
5. Re-upload attendance data after adding holidays for accurate recalculation

#### 3. Edit Hourly Rates
1. In the Records tab, locate the employee
2. Click the edit icon next to their hourly rate
3. Enter new rate
4. Press Enter or click checkmark
5. Total salary updates automatically

#### 4. Export Data
1. View salary records for desired month
2. Click "Export to Excel" button
3. Excel file downloads with all salary data
4. Use for payroll processing or reporting

### Integration with Existing System

The salary routes are already integrated in `server/index.js`:
```javascript
const salaryRoutes = require('./routes/salaryRoutes');
app.use("/api/salary", salaryRoutes);
```

The upload directory is created at: `server/uploads/salary/`

## Database Collections

### employees
Should already exist in your system with:
- `employeeId`: String
- `name`: String  
- `hourlyRate`: Number (default hourly pay rate)

### holidays
Created automatically when first holiday is added.

### salary_records
Created automatically when first file is uploaded.

## Security & Permissions

- All routes require authentication (`protect` middleware)
- Upload, update rate, delete, and manage holidays require admin role (`adminAuth` middleware)
- File uploads are validated for type and size (10MB limit)
- Files are deleted after processing to save disk space
- SQL injection protected through Mongoose schemas
- XSS protection through React's built-in escaping

## Error Handling

The system handles:
- Invalid file formats
- Missing columns in uploaded files
- Invalid date/time formats
- Missing employee records
- Duplicate uploads (updates existing records)
- Network failures (with user-friendly messages)
- File size limits
- Malformed data

## Performance Considerations

- Files processed in-memory for speed
- Batch updates to database
- Indexes on `employeeId` and `month` for fast queries
- Efficient date parsing with multiple format support
- Automatic cleanup of temporary files

## Future Enhancements

Potential additions:
- Bulk employee hourly rate updates
- Salary approval workflow
- Email notifications for salary processing
- PDF export with formatting
- Advanced filters and search
- Salary history comparison
- Attendance report generation
- Integration with payroll systems

## Troubleshooting

### Upload fails with "No data found"
- Check that your Excel file has data rows (not just headers)
- Verify column names match expected format

### Hours calculated as 0
- Ensure Punch In/Out times are in recognized formats (HH:MM, HH:MM AM/PM)
- Check that dates are not marked as holidays

### Missing employee hourly rates
- Ensure employees exist in the `employees` collection
- Add `hourlyRate` field to employee records

### File upload too slow
- Files larger than 10MB are rejected
- Reduce file size or split into monthly files

## Support

For issues or questions:
1. Check the expected file format
2. Verify employee records exist
3. Check console for error messages
4. Review server logs for detailed error information

---

**Created**: November 2025  
**Version**: 1.0.0  
**Tech Stack**: Node.js, Express, MongoDB, React, Tailwind CSS
