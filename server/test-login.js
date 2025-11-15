require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // List all users
    const users = await User.find({}, 'name email role');
    console.log('\n=== Available Users ===');
    users.forEach(user => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

    // Test admin login
    const adminEmail = 'admin.local@infiverse.test';
    const adminPassword = 'AdminPass123';
    
    const admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log(`\n=== Admin User Found ===`);
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Password in DB: ${admin.password}`);
      console.log(`Test Password: ${adminPassword}`);
      console.log(`Password Match: ${admin.password === adminPassword}`);
    } else {
      console.log('\n❌ Admin user not found');
    }

    // Test procurement agent login
    const procurementEmail = 'procurement@infiverse.test';
    const procurementPassword = 'ProcurementPass123';
    
    const procurementAgent = await User.findOne({ email: procurementEmail });
    if (procurementAgent) {
      console.log(`\n=== Procurement Agent Found ===`);
      console.log(`Name: ${procurementAgent.name}`);
      console.log(`Email: ${procurementAgent.email}`);
      console.log(`Role: ${procurementAgent.role}`);
      console.log(`Password in DB: ${procurementAgent.password}`);
      console.log(`Test Password: ${procurementPassword}`);
      console.log(`Password Match: ${procurementAgent.password === procurementPassword}`);
    } else {
      console.log('\n❌ Procurement agent not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();