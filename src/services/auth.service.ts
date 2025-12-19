import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../config/env.config';

/**
 * Generate access token with userId
 * @param userId - User ID to include in token
 * @returns JWT access token
 */
export const generateAccessToken = async (userId: string): Promise<string> => {
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not configured');
  }
  // @ts-expect-error - expiresIn accepts string values like '15m', '7d' which is valid
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generate refresh token with userId and email
 * @param userId - User ID to include in token
 * @param email - User email to include in token
 * @returns JWT refresh token
 */
export const generateRefreshToken = async (userId: string, email: string): Promise<string> => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  // @ts-expect-error - expiresIn accepts string values like '15m', '7d' which is valid
  return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Generate both access and refresh tokens for a user
 * Also saves the refresh token to the user's record in the database
 * @param user - User document from database
 * @returns Object containing accessToken and refreshToken
 */
export const generateAccessAndRefreshToken = async (user: any): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const userId = user._id.toString();
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId, user.email);

  return { accessToken, refreshToken };
};