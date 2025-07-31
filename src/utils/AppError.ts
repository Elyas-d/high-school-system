export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly code: string | undefined;
  public readonly details: any | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // Static factory methods for common error types
  static badRequest(message: string, code?: string, details?: any): AppError {
    return new AppError(message, 400, true, code, details);
  }

  static unauthorized(message: string = 'Unauthorized access', code?: string, details?: any): AppError {
    return new AppError(message, 401, true, code, details);
  }

  static forbidden(message: string = 'Forbidden access', code?: string, details?: any): AppError {
    return new AppError(message, 403, true, code, details);
  }

  static notFound(message: string = 'Resource not found', code?: string, details?: any): AppError {
    return new AppError(message, 404, true, code, details);
  }

  static conflict(message: string, code?: string, details?: any): AppError {
    return new AppError(message, 409, true, code, details);
  }

  static validationError(message: string, details?: any): AppError {
    return new AppError(message, 422, true, 'VALIDATION_ERROR', details);
  }

  static internal(message: string = 'Internal server error', code?: string, details?: any): AppError {
    return new AppError(message, 500, false, code, details);
  }

  static serviceUnavailable(message: string = 'Service temporarily unavailable', code?: string, details?: any): AppError {
    return new AppError(message, 503, true, code, details);
  }

  // Method to serialize error for JSON response
  toJSON(): object {
    return {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      ...(this.details && { details: this.details }),
    };
  }
} 