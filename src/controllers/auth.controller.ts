import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateAccessAndRefreshToken } from '../services/auth.service';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profileUrl?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { username (name), email, profileUrl? }
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password, profileUrl = "" }: RegisterRequest = req.body;

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

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Validate password length
    if (password.length < 7 || password.length > 100) {
      return res.status(400).json({ message: 'Password must be between 7 and 100 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
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

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: 'The email is required.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'The password is required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'The email format is invalid.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists first, then validate password
    if (!user) {
      return res.status(401).json({ message: 'The email or password is incorrect.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'The email or password is incorrect.' });
    }

    // Generate tokens using service
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    // Save refreshToken to database
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: 'Login successful',
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
    console.error('Error logging in user:', error);

    return res.status(500).json({
      message: 'Failed to login user' + (error instanceof Error ? 
        error.message : 'Unknown error'),
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Requires: Authorization header with Bearer token (accessToken)
 * Middleware: verifyToken (extracts userId from token)
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    // userId is set by verifyToken middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized request.' });
    }

    // Find user by userId
    const user = await User.findById(userId);

    if (!user) { // User doesn't exist - still return success for security
      return res.status(200).json({ message: 'Logout successful' });
    }

    // Clear refreshToken from database
    user.refreshToken = '';
    await user.save();

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);

    return res.status(500).json({
      message: 'Failed to logout user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

