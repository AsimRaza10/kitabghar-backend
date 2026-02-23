import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bookstore.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@bookstore.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: 'Admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@bookstore.com');
    console.log('Password: Admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
