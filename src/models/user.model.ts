import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * User document interface
 */
export interface IUser extends Document {
  username: string;
  email: string;
  profileUrl?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema definition
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    profileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    refreshToken: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ refreshToken: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);