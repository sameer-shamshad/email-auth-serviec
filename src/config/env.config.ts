import dotenv from 'dotenv';
dotenv.config();

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI;
export const EMAIL_HOST = process.env.EMAIL_HOST || '';
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || '';