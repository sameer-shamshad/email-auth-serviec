import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/env.config';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction): Response | void => {
  const token = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Unauthorized request.' });

  if (!JWT_ACCESS_SECRET) {
    return res.status(500).json({ message: 'JWT secret not configured.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string };
    
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token: userId not found.' });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(401).json({ message: 'Unauthorized request.' });
  }
};