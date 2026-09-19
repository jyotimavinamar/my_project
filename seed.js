require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log('MongoDB Connected ✅');

  const adminExists = await User.findOne({ email: 'admin' });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin', password: adminPassword, role: 'admin' });
    console.log('Created Admin account (Email: admin, Password: admin123)');
  } else {
    console.log('Admin account already exists.');
  }

  const studentExists = await User.findOne({ email: 'student' });
  if (!studentExists) {
    const studentPassword = await bcrypt.hash('student123', 10);
    await User.create({ name: 'Student', email: 'student', password: studentPassword, role: 'student' });
    console.log('Created Student account (Email: student, Password: student123)');
  } else {
    console.log('Student account already exists.');
  }

  process.exit();
}).catch((err) => {
  console.log('DB Error:', err);
  process.exit(1);
});
