const mongoose = require('mongoose');

/**
 * SalaryRecord Schema
 * Stores calculated salary information for employees based on biometric attendance data
 */
const salaryRecordSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  month: {
    type: String, // Format: "YYYY-MM" (e.g., "2025-11")
    required: true,
    index: true
  },
  totalHours: {
    type: Number,
    required: true,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    default: 0
  },
  totalSalary: {
    type: Number,
    required: true,
    default: 0
  },
  holidaysExcluded: {
    type: [String], // Array of dates excluded as holidays (format: "YYYY-MM-DD")
    default: []
  },
  dailyRecords: [{
    date: String, // Format: "YYYY-MM-DD"
    punchIn: String,
    punchOut: String,
    hoursWorked: Number,
    isHoliday: Boolean
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by employee and month
salaryRecordSchema.index({ employeeId: 1, month: 1 });

// Pre-save middleware to update lastModified
salaryRecordSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('SalaryRecord', salaryRecordSchema);
