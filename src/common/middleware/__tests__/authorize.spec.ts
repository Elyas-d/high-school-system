import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { authorize } from '../authorize';
import { AuthenticatedRequest } from '../authenticate';

describe('authorize middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('user with allowed role', () => {
    it('should call next() when user has ADMIN role and ADMIN is allowed', () => {
      mockRequest.user = {
        id: 'user-123',
        role: UserRole.ADMIN,
        email: 'admin@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when user has TEACHER role and TEACHER is allowed', () => {
      mockRequest.user = {
        id: 'user-456',
        role: UserRole.TEACHER,
        email: 'teacher@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN, UserRole.TEACHER]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when user has STUDENT role and STUDENT is allowed', () => {
      mockRequest.user = {
        id: 'user-789',
        role: UserRole.STUDENT,
        email: 'student@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.STUDENT, UserRole.PARENT]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('user with disallowed role', () => {
    it('should return 403 when user has STUDENT role but only ADMIN is allowed', () => {
      mockRequest.user = {
        id: 'user-123',
        role: UserRole.STUDENT,
        email: 'student@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Access denied. Required roles: ADMIN. Your role: STUDENT',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user has PARENT role but TEACHER and STAFF are allowed', () => {
      mockRequest.user = {
        id: 'user-456',
        role: UserRole.PARENT,
        email: 'parent@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.TEACHER, UserRole.STAFF]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Access denied. Required roles: TEACHER, STAFF. Your role: PARENT',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user has STAFF role but only ADMIN is allowed', () => {
      mockRequest.user = {
        id: 'user-789',
        role: UserRole.STAFF,
        email: 'staff@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Access denied. Required roles: ADMIN. Your role: STAFF',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('missing user', () => {
    it('should return 401 when req.user is undefined', () => {
      mockRequest.user = undefined;

      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      mockRequest.user = null as any;

      const authorizeMiddleware = authorize([UserRole.TEACHER]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('multiple allowed roles', () => {
    it('should call next() when user has one of multiple allowed roles', () => {
      mockRequest.user = {
        id: 'user-123',
        role: UserRole.TEACHER,
        email: 'teacher@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN, UserRole.TEACHER, UserRole.STAFF]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user has none of the multiple allowed roles', () => {
      mockRequest.user = {
        id: 'user-456',
        role: UserRole.STUDENT,
        email: 'student@school.com',
      };

      const authorizeMiddleware = authorize([UserRole.ADMIN, UserRole.TEACHER, UserRole.STAFF]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Access denied. Required roles: ADMIN, TEACHER, STAFF. Your role: STUDENT',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 for unexpected errors', () => {
      mockRequest.user = {
        id: 'user-123',
        role: UserRole.ADMIN,
        email: 'admin@school.com',
      };

      // Mock an error by making the includes method throw
      const originalIncludes = Array.prototype.includes;
      Array.prototype.includes = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      authorizeMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Authorization failed',
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Restore original method
      Array.prototype.includes = originalIncludes;
    });
  });
}); 