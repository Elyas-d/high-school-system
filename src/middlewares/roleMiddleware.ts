import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to check if user has required role
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role as UserRole)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Middleware to check if user is ADMIN
 */
export const requireAdmin = requireRole([UserRole.ADMIN]);

/**
 * Middleware to check if user is ADMIN or STAFF
 */
export const requireAdminOrStaff = requireRole([UserRole.ADMIN, UserRole.STAFF]);

/**
 * Middleware to check if user is TEACHER
 */
export const requireTeacher = requireRole([UserRole.TEACHER]);

/**
 * Middleware to check if user is TEACHER or ADMIN
 */
export const requireTeacherOrAdmin = requireRole([UserRole.TEACHER, UserRole.ADMIN]);

/**
 * Middleware to check if user is STUDENT
 */
export const requireStudent = requireRole([UserRole.STUDENT]);

/**
 * Middleware to check if user is PARENT
 */
export const requireParent = requireRole([UserRole.PARENT]);

/**
 * Middleware to check if user is PARENT or ADMIN
 */
export const requireParentOrAdmin = requireRole([UserRole.PARENT, UserRole.ADMIN]);

/**
 * Middleware to check if user is STAFF
 */
export const requireStaff = requireRole([UserRole.STAFF]);

/**
 * Middleware to check if user is STAFF or ADMIN
 */
export const requireStaffOrAdmin = requireRole([UserRole.STAFF, UserRole.ADMIN]);

/**
 * Middleware to check if user is authenticated (any role)
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param getUserId - Function to extract user ID from request
 */
export const requireOwnershipOrAdmin = (getUserId: (req: AuthenticatedRequest) => string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const resourceUserId = getUserId(req);
      const isOwner = req.user.userId === resourceUserId;
      const isAdmin = req.user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Middleware to check if user is in the same class or is admin/teacher
 * @param getClassId - Function to extract class ID from request
 */
export const requireClassAccess = (getClassId: (req: AuthenticatedRequest) => string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Admin and teachers have access to all classes
      if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.TEACHER) {
        next();
        return;
      }

      // For students, check if they are enrolled in the class
      if (req.user.role === UserRole.STUDENT) {
        // This would require additional logic to check class enrollment
        // For now, we'll allow access (implement class enrollment check later)
        next();
        return;
      }

      // For parents, check if their child is in the class
      if (req.user.role === UserRole.PARENT) {
        // This would require additional logic to check child's class enrollment
        // For now, we'll allow access (implement parent-child class check later)
        next();
        return;
      }

      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this class.',
      });
    } catch (error) {
      console.error('Class access middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

export default {
  requireRole,
  requireAdmin,
  requireAdminOrStaff,
  requireTeacher,
  requireTeacherOrAdmin,
  requireStudent,
  requireParent,
  requireParentOrAdmin,
  requireStaff,
  requireStaffOrAdmin,
  requireAuth,
  requireOwnershipOrAdmin,
  requireClassAccess,
}; 