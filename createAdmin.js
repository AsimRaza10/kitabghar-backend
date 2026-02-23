import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema (simplified)
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: Date,
      updatedAt: Date
    });

    const User = mongoose.model('User', userSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bookstore.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@bookstore.com',
        password: '$2a$10$rGylmi4HwZCOETJvyl0dFO9no3nhRhrenzd2JRoFFPcFpzt4bsh.2',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Password: admin123');
      console.log('👤 Role:', adminUser.role);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Done! You can now login with:');
    console.log('   Email: admin@bookstore.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

createAdminUser();
