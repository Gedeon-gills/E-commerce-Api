import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('✅ MongoDB Connected successfully');
      break;
    } catch (err) {
      console.error(`❌ MongoDB connection error: ${err}`);
      retries -= 1;
      console.log(`Retries left: ${retries}. Waiting 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000));
      if (retries === 0) process.exit(1);
    }
  }
};

export default connectDB;
