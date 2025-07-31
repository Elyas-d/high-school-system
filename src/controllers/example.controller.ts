import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middlewares/errorHandler';

export class ExampleController {
  /**
   * Example: Throw validation error for invalid input
   */
  public validateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, age } = req.body;

    // Example validation logic
    if (!email) {
      throw AppError.validationError('Email is required', { field: 'email' });
    }

    if (!email.includes('@')) {
      throw AppError.validationError('Invalid email format', { 
        field: 'email', 
        value: email,
        expected: 'valid email format'
      });
    }

    if (age && (age < 0 || age > 120)) {
      throw AppError.validationError('Age must be between 0 and 120', { 
        field: 'age', 
        value: age,
        min: 0,
        max: 120
      });
    }

    res.status(200).json({
      success: true,
      message: 'Validation passed',
      data: { email, age }
    });
  });

  /**
   * Example: Throw unauthorized error for missing authentication
   */
  public requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw AppError.unauthorized('Authentication token required', 'MISSING_TOKEN');
    }

    if (!token.startsWith('Bearer ')) {
      throw AppError.unauthorized('Invalid token format. Use Bearer <token>', 'INVALID_TOKEN_FORMAT');
    }

    // Simulate token validation
    const tokenValue = token.split(' ')[1];
    if (tokenValue === 'invalid-token') {
      throw AppError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: { userId: 'user-123' }
    });
  });

  /**
   * Example: Throw forbidden error for insufficient permissions
   */
  public requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      throw AppError.unauthorized('User not authenticated', 'NOT_AUTHENTICATED');
    }

    if (userRole !== 'ADMIN') {
      throw AppError.forbidden(
        'Admin access required', 
        'INSUFFICIENT_PERMISSIONS',
        { 
          requiredRole: 'ADMIN', 
          userRole: userRole 
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Admin access granted',
      data: { adminActions: ['delete', 'modify', 'create'] }
    });
  });

  /**
   * Example: Throw not found error for missing resource
   */
  public getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Simulate database lookup
    const user = await this.findUserById(id || '');

    if (!user) {
      throw AppError.notFound(
        `User with ID ${id} not found`, 
        'USER_NOT_FOUND',
        { userId: id || 'undefined' }
      );
    }

    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * Example: Throw conflict error for duplicate resource
   */
  public createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Simulate checking if user already exists
    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      throw AppError.conflict(
        `User with email ${email} already exists`, 
        'DUPLICATE_EMAIL',
        { email, existingUserId: existingUser.id }
      );
    }

    // Simulate user creation
    const newUser = { id: 'new-user-123', email, createdAt: new Date() };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  });

  /**
   * Example: Throw bad request error for invalid parameters
   */
  public updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { email, status } = req.body;

    if (!id || id.length < 3) {
      throw AppError.badRequest(
        'Invalid user ID provided', 
        'INVALID_USER_ID',
        { providedId: id || 'undefined', minLength: 3 }
      );
    }

    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      throw AppError.badRequest(
        'Invalid status value', 
        'INVALID_STATUS',
        { 
          providedStatus: status as string, 
          allowedValues: ['active', 'inactive', 'suspended'] 
        }
      );
    }

    // Simulate user update
    const updatedUser = { id, email, status, updatedAt: new Date() };

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  });

  /**
   * Example: Throw internal server error for unexpected issues
   */
  public simulateError = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { errorType } = req.query;

    switch (errorType) {
      case 'database':
        throw AppError.internal(
          'Database connection failed', 
          'DATABASE_CONNECTION_ERROR',
          { retryAfter: 30 }
        );
      
      case 'external':
        throw AppError.serviceUnavailable(
          'External service unavailable', 
          'EXTERNAL_SERVICE_ERROR',
          { service: 'payment-gateway', retryAfter: 60 }
        );
      
      case 'validation':
        throw AppError.validationError('Multiple validation errors', [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' }
        ]);
      
      default:
        throw AppError.internal('Unexpected error occurred', 'UNEXPECTED_ERROR');
    }
  });

  // Helper methods (simulated)
  private async findUserById(id: string): Promise<any> {
    // Simulate database lookup
    if (id === 'existing-user') {
      return { id, name: 'John Doe', email: 'john@example.com' };
    }
    return null;
  }

  private async findUserByEmail(email: string): Promise<any> {
    // Simulate database lookup
    if (email === 'existing@example.com') {
      return { id: 'existing-user', email };
    }
    return null;
  }
} 