import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './authenticate';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      // Check if user is authenticated
      const userReq = req as AuthenticatedRequest;
      if (!userReq.user) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Authentication required',
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userReq.user.role)) {
        return res.status(403).json({
          statusCode: 403,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userReq.user.role}`,
        });
      }

      // User is authorized, proceed
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Authorization failed',
      });
    }
  };
}; 