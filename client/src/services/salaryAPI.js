import axios from 'axios';

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Salary API Service
 * Handles all API calls related to salary management
 */

// Create axios instance with default config
const salaryAPI = axios.create({
  baseURL: `${API_BASE_URL}/biometric-salary`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
salaryAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Send token in both headers to support different middlewares
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token; // server/middleware/auth.js expects this header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Upload biometric attendance file and calculate salaries
 * @param {File} file - Excel or CSV file
 * @returns {Promise} - Calculated salary records
 */
export const uploadBiometricFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await salaryAPI.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Redundant but explicit: include x-auth-token for the upload request as well
        ...(localStorage.getItem('token') ? { 'x-auth-token': localStorage.getItem('token') } : {}),
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload file' };
  }
};

/**
 * Get salary records for a specific month
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise} - Salary records for the month
 */
export const getSalaryByMonth = async (month) => {
  try {
    const response = await salaryAPI.get(`/${month}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch salary records' };
  }
};

/**
 * Update hourly rate for a salary record
 * @param {string} id - Salary record ID
 * @param {number} hourlyRate - New hourly rate
 * @returns {Promise} - Updated salary record
 */
export const updateHourlyRate = async (id, hourlyRate) => {
  try {
    const response = await salaryAPI.put(`/${id}/rate`, { hourlyRate });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update hourly rate' };
  }
};

/**
 * Delete a salary record
 * @param {string} id - Salary record ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteSalaryRecord = async (id) => {
  try {
    const response = await salaryAPI.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete salary record' };
  }
};

/**
 * Get salary statistics for a month
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise} - Salary statistics
 */
export const getSalaryStats = async (month) => {
  try {
    const response = await salaryAPI.get(`/stats/${month}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch salary statistics' };
  }
};

/**
 * Get all holidays
 * @param {object} params - Query parameters (month, year)
 * @returns {Promise} - List of holidays
 */
export const getHolidays = async (params = {}) => {
  try {
    const response = await salaryAPI.get('/holidays', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch holidays' };
  }
};

/**
 * Add or update a holiday
 * @param {object} holidayData - Holiday data (date, description, type, isRecurring)
 * @returns {Promise} - Created/updated holiday
 */
export const manageHoliday = async (holidayData) => {
  try {
    const response = await salaryAPI.post('/holidays', holidayData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to manage holiday' };
  }
};

/**
 * Delete a holiday
 * @param {string} id - Holiday ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteHoliday = async (id) => {
  try {
    const response = await salaryAPI.delete(`/holidays/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete holiday' };
  }
};

export default {
  uploadBiometricFile,
  getSalaryByMonth,
  updateHourlyRate,
  deleteSalaryRecord,
  getSalaryStats,
  getHolidays,
  manageHoliday,
  deleteHoliday,
};
