import mongoose from 'mongoose';
import User from '../src/models/User';
import connectDB from '../src/config/db';
import { env } from '../src/config/env';

const seedAdmin = async () => {
  try {
    console.log('🌱 Seeding admin...');
    await connectDB();
    
    const adminExists = await User.findOne({ email: env.ADMIN_EMAIL });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('✅ Admin user created successfully.');
    } else {
      console.log('⚠️ Admin already exists.');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedAdmin();
