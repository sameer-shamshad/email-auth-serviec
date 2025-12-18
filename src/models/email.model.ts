import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Email document interface
 */
export interface IEmail extends Document {
  name: string;
  email: string;
  message: string;
  subject: string;
  from: string;
  to: string;
  messageId?: string;
  status: 'sent' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email schema definition
 */
const emailSchema = new Schema<IEmail>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    from: {
      type: String,
      required: [true, 'From email is required'],
      trim: true,
    },
    to: {
      type: String,
      required: [true, 'To email is required'],
      trim: true,
      lowercase: true,
    },
    messageId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    error: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

emailSchema.index({ email: 1 });
emailSchema.index({ createdAt: -1 });
emailSchema.index({ status: 1 });

export const Email: Model<IEmail> = mongoose.model<IEmail>('Email', emailSchema);