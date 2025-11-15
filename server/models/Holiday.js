const mongoose = require('mongoose');

/**
 * Holiday Schema
 * Stores holiday dates to exclude from salary calculations
 */
const holidaySchema = new mongoose.Schema({
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['public', 'company', 'optional'],
    default: 'public'
  },
  isRecurring: {
    type: Boolean,
    default: false // If true, applies every year
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to check if a date is a holiday
holidaySchema.statics.isHoliday = async function(date) {
  const holiday = await this.findOne({ date });
  return !!holiday;
};

// Static method to get all holidays for a specific month
holidaySchema.statics.getHolidaysForMonth = async function(month) {
  // month format: "YYYY-MM"
  const startDate = `${month}-01`;
  const year = month.split('-')[0];
  const monthNum = month.split('-')[1];
  const lastDay = new Date(year, monthNum, 0).getDate();
  const endDate = `${month}-${lastDay}`;
  
  return await this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

module.exports = mongoose.model('Holiday', holidaySchema);
