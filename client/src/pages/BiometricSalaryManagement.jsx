import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Download,
  Upload,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import * as XLSX from 'xlsx';
import salaryAPI from '../services/salaryAPI';

const BiometricSalaryManagement = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  
  // Holiday form state
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [holidayType, setHolidayType] = useState('public');
  
  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(month);
  }, []);
  
  // Fetch data when month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchSalaryRecords();
      fetchHolidays();
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  /**
   * Fetch salary records for selected month
   */
  const fetchSalaryRecords = async () => {
    try {
      setLoading(true);
      const response = await salaryAPI.getSalaryByMonth(selectedMonth);
      setSalaryRecords(response.data.records || []);
    } catch (err) {
      console.error('Error fetching salary records:', err);
      setError(err.message || 'Failed to fetch salary records');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch holidays
   */
  const fetchHolidays = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const response = await salaryAPI.getHolidays({ year, month });
      setHolidays(response.data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };
  
  /**
   * Fetch salary statistics
   */
  const fetchStats = async () => {
    try {
      const response = await salaryAPI.getSalaryStats(selectedMonth);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        setSelectedFile(null);
      }
    }
  };
  
  /**
   * Upload and process biometric file
   */
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      const response = await salaryAPI.uploadBiometricFile(selectedFile);
      
      setSuccess(response.message);
      setSelectedFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
      // Refresh data
      await fetchSalaryRecords();
      await fetchStats();
      
      // Switch to records tab
      setActiveTab('records');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload and process file');
    } finally {
      setUploading(false);
    }
  };
  
  /**
   * Update hourly rate
   */
  const handleUpdateRate = async (recordId, newRate) => {
    try {
      const rate = parseFloat(newRate);
      if (isNaN(rate) || rate < 0) {
        setError('Please enter a valid hourly rate');
        return;
      }
      
      await salaryAPI.updateHourlyRate(recordId, rate);
      setSuccess('Hourly rate updated successfully');
      setEditingRate(null);
      await fetchSalaryRecords();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to update hourly rate');
    }
  };
  
  /**
   * Delete salary record
   */
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) {
      return;
    }
    
    try {
      await salaryAPI.deleteSalaryRecord(recordId);
      setSuccess('Salary record deleted successfully');
      await fetchSalaryRecords();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to delete salary record');
    }
  };
  
  /**
   * Add or update holiday
   */
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    
    if (!holidayDate || !holidayDescription) {
      setError('Date and description are required');
      return;
    }
    
    try {
      await salaryAPI.manageHoliday({
        date: holidayDate,
        description: holidayDescription,
        type: holidayType
      });
      
      setSuccess('Holiday added successfully');
      setHolidayDate('');
      setHolidayDescription('');
      setHolidayType('public');
      await fetchHolidays();
    } catch (err) {
      setError(err.message || 'Failed to add holiday');
    }
  };
  
  /**
   * Delete holiday
   */
  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }
    
    try {
      await salaryAPI.deleteHoliday(holidayId);
      setSuccess('Holiday deleted successfully');
      await fetchHolidays();
      await fetchSalaryRecords();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to delete holiday');
    }
  };
  
  /**
   * Export to Excel
   */
  const handleExportToExcel = () => {
    if (salaryRecords.length === 0) {
      setError('No data to export');
      return;
    }
    
    try {
      const exportData = salaryRecords.map(record => ({
        'Employee ID': record.employeeId,
        'Name': record.name,
        'Total Hours': record.totalHours.toFixed(2),
        'Hourly Rate': record.hourlyRate.toFixed(2),
        'Total Salary': record.totalSalary.toFixed(2),
        'Holidays Excluded': record.holidaysExcluded.length,
        'Status': record.status
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Salary Records');
      
      XLSX.writeFile(wb, `Salary_Report_${selectedMonth}.xlsx`);
      setSuccess('Exported successfully');
    } catch {
      setError('Failed to export data');
    }
  };
  
  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Biometric Salary Management
            </h1>
            <p className="text-gray-600 mt-1">
              Upload biometric data and manage employee salaries
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Label htmlFor="month-select" className="text-sm font-medium text-gray-700">
              Month:
            </Label>
            <Input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        
        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalEmployees}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(stats.totalSalary)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Total Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.totalHours.toFixed(0)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Avg Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(stats.averageSalary)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Holidays
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Biometric Attendance Data</CardTitle>
                <CardDescription>
                  Upload Excel or CSV file containing employee attendance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Select File
                  </Label>
                  
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <p className="text-sm text-gray-500 mt-3">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                  
                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Expected File Format
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Your file should contain the following columns:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Employee ID / EmployeeID / empId</li>
                    <li>Name / Employee Name / EmployeeName</li>
                    <li>Date / Attendance Date</li>
                    <li>Punch In / PunchIn / In Time / Check In</li>
                    <li>Punch Out / PunchOut / Out Time / Check Out</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Calculate Salary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Records Tab */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Salary Records - {selectedMonth}</CardTitle>
                    <CardDescription>
                      {salaryRecords.length} employee{salaryRecords.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  
                  <Button
                    onClick={handleExportToExcel}
                    variant="outline"
                    disabled={salaryRecords.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
                    <p className="text-gray-500 mt-4">Loading salary records...</p>
                  </div>
                ) : salaryRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No salary records found for this month</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Upload biometric data to generate salary records
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Hours
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hourly Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Salary
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Holidays
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salaryRecords.map((record) => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.employeeId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {record.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {record.totalHours.toFixed(2)} hrs
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {editingRate === record._id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    defaultValue={record.hourlyRate}
                                    className="w-24"
                                    id={`rate-${record._id}`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateRate(
                                          record._id,
                                          e.target.value
                                        );
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingRate(null);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const input = document.getElementById(
                                        `rate-${record._id}`
                                      );
                                      handleUpdateRate(record._id, input.value);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingRate(null)}
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {formatCurrency(record.hourlyRate)}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingRate(record._id)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                              {formatCurrency(record.totalSalary)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {record.holidaysExcluded.length} days
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge
                                variant={
                                  record.status === 'paid'
                                    ? 'success'
                                    : record.status === 'approved'
                                    ? 'warning'
                                    : 'default'
                                }
                              >
                                {record.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRecord(record._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Holidays Tab */}
          <TabsContent value="holidays">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Holiday Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Holiday</CardTitle>
                  <CardDescription>
                    Holidays will be excluded from salary calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddHoliday} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="holiday-date">Date</Label>
                      <Input
                        id="holiday-date"
                        type="date"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="holiday-description">Description</Label>
                      <Input
                        id="holiday-description"
                        type="text"
                        placeholder="e.g., Independence Day"
                        value={holidayDescription}
                        onChange={(e) => setHolidayDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="holiday-type">Type</Label>
                      <select
                        id="holiday-type"
                        value={holidayType}
                        onChange={(e) => setHolidayType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">Public Holiday</option>
                        <option value="company">Company Holiday</option>
                        <option value="optional">Optional Holiday</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add Holiday
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Holidays List */}
              <Card>
                <CardHeader>
                  <CardTitle>Holidays - {selectedMonth}</CardTitle>
                  <CardDescription>
                    {holidays.length} holiday{holidays.length !== 1 ? 's' : ''} this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {holidays.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No holidays added</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {holidays.map((holiday) => (
                        <div
                          key={holiday._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {new Date(holiday.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {holiday.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {holiday.description}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteHoliday(holiday._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BiometricSalaryManagement;
