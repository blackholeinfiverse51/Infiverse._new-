require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createProcurementAgent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if procurement agent already exists
    const existingAgent = await User.findOne({ email: 'procurement@infiverse.test' });
    if (existingAgent) {
      console.log('Procurement agent already exists:', existingAgent.name);
      process.exit(0);
    }

    // Create procurement agent
    const procurementAgent = new User({
      name: 'Procurement Agent',
      email: 'procurement@infiverse.test',
      password: 'ProcurementPass123', // In production, this should be hashed
      role: 'Procurement Agent'
    });

    await procurementAgent.save();
    console.log('✅ Procurement agent created successfully!');
    console.log('Email: procurement@infiverse.test');
    console.log('Password: ProcurementPass123');
    console.log('Role: Procurement Agent');

    process.exit(0);
  } catch (error) {
    console.error('Error creating procurement agent:', error);
    process.exit(1);
  }
}

createProcurementAgent();