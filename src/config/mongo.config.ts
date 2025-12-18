import mongoose from 'mongoose';
import { MONGODB_URI, NODE_ENV } from './env.config';

/**
 * Connect to MongoDB database
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options: mongoose.ConnectOptions = {
      // Remove deprecated options, use modern defaults
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    if (NODE_ENV === 'production') {
      process.exit(1); // Exit in production if DB connection fails
    }
    throw error;
  }
};

export default connectMongoDB;

