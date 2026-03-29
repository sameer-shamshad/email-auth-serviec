import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

/**
 * Middleware to verify user is an admin
 * Must be used after verifyAccessToken middleware
 */
export const verifyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized request.' });
    }

    // Find user and check role
    const user = await User.findById(userId).select('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Error verifying admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

