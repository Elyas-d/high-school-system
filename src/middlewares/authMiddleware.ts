import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth.types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 * Protects routes by validating JWT and attaching user info to req.user
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'] || 'your-secret-key';
    
    jwt.verify(token, jwtSecret as jwt.Secret, (err: any, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            message: 'Token has expired',
          });
        } else if (err.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Token verification failed',
          });
        }
        return;
      }

      const payload = decoded as JWTPayload;
      
      // Attach user information to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't return error if no token
 * Useful for routes that can work with or without authentication
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'] || 'your-secret-key';
    
    jwt.verify(token, jwtSecret as jwt.Secret, (err: any, decoded: any) => {
      if (err) {
        // Token is invalid, but we don't return error for optional auth
        next();
        return;
      }

      const payload = decoded as JWTPayload;
      
      // Attach user information to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    });
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // Continue without authentication on error
    next();
  }
};

/**
 * Verify token without middleware
 * Useful for custom authentication logic
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const jwtSecret = process.env['JWT_SECRET'] || 'your-secret-key';
    return jwt.verify(token, jwtSecret as jwt.Secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export default {
  authenticateToken,
  optionalAuth,
  verifyToken,
}; 