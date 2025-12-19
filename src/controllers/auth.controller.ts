import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateAccessAndRefreshToken } from '../services/auth.service';

interface RegisterRequest {
  username: string;
  email: string;
  profileUrl?: string;
}

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { username (name), email, profileUrl? }
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, profileUrl = "" }: RegisterRequest = req.body;

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate name length
    if (username.length < 1 || username.length > 100) {
      return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      profileUrl,
    });

    // Generate tokens using service
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    // Save refreshToken to database
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileUrl: user.profileUrl,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);

    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(409).json({
        message: 'Username or email already exists',
      });
    }

    return res.status(500).json({
      message: 'Failed to register user' + (error instanceof Error ? 
        error.message : 'Unknown error'),
    });
  }
};

