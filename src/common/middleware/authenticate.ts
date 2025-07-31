import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Access token required',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        statusCode: 500,
        message: 'Server configuration error',
      });
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      role: UserRole;
      email: string;
    };

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token expired',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Authentication failed',
    });
  }
}; 