import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthenticatedRequest } from '../authenticate';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('authenticate middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    
    // Reset environment variable
    process.env['JWT_SECRET'] = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('valid token', () => {
    it('should decode token and attach user to req.user', () => {
      const mockUser = {
        id: 'user-123',
        role: 'ADMIN' as const,
        email: 'admin@school.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockedJwt.verify.mockImplementation(() => mockUser);

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('missing token', () => {
    it('should return 401 when Authorization header is missing', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Invalid valid-token',
      };

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('invalid token', () => {
    it('should return 401 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Token expired',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('server configuration error', () => {
    it('should return 500 when JWT_SECRET is not configured', () => {
      delete process.env['JWT_SECRET'];
      
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Server configuration error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('unexpected errors', () => {
    it('should return 500 for unexpected errors', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Authentication failed',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 