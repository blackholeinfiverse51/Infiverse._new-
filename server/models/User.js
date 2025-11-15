const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Manager", "User", "Procurement Agent"],
    default: "User",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  avatar: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
  },
  profilePicture: {
    type: String,
  },
  stillExist: {
    type: Number,
    default: 1,
    enum: [0, 1], // 0 = exited, 1 = active
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  monitoringPaused: {
    type: Boolean,
    default: false,
  },
  lastConsentDate: {
    type: Date,
  },
  dataRetentionPeriod: {
    type: Number, // in days
    default: 30,
  },
  // Salary management fields
  employeeId: {
    type: String,
    trim: true,
    index: true,
  },
  hourlyRate: {
    type: Number,
    default: 25, // Default hourly rate in USD
  },
})

// Update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("User", UserSchema)