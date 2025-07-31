import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export interface AppErrorInterface extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code: string | undefined;
  details: any | undefined;
  timestamp?: Date;
}

export const errorHandler = (
  err: AppErrorInterface,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error('Error occurred:', {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: (err as AppError).statusCode,
      code: (err as AppError).code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    timestamp: new Date().toISOString(),
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = new AppError('Database operation failed', 500, false, 'DATABASE_ERROR');
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = AppError.validationError('Invalid data provided', { field: err.message });
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = new AppError('Database connection failed', 503, false, 'DATABASE_CONNECTION_ERROR');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = AppError.unauthorized('Invalid token', 'INVALID_TOKEN');
  } else if (err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Token expired', 'TOKEN_EXPIRED');
  }

  // Handle validation errors from class-validator
  if (err.name === 'ValidationError' || Array.isArray(err.message)) {
    error = AppError.validationError('Validation failed', err.message);
  }

  // Handle duplicate key errors (MongoDB/PostgreSQL)
  if (err.code === 'P2002' || err.code === 11000) {
    const meta = (err as any).meta;
    const target = meta?.['target'] as string[] | undefined;
    const field = target?.[0] || 'field';
    error = AppError.conflict(`${field} already exists`, 'DUPLICATE_FIELD', { field });
  }

  // Handle foreign key constraint errors
  if (err.code === 'P2003') {
    error = AppError.badRequest('Referenced record does not exist', 'FOREIGN_KEY_CONSTRAINT');
  }

  // Handle record not found errors
  if (err.code === 'P2025') {
    error = AppError.notFound('Record not found', 'RECORD_NOT_FOUND');
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    error = err;
  }

  // Default error handling
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Prepare error response
  const errorResponse: any = {
    statusCode: error.statusCode,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  // Add error code if available
  if (error.code) {
    errorResponse.code = error.code;
  }

  // Add details if available
  if (error.details) {
    errorResponse.details = error.details;
  }

  // Add stack trace only in development
  if (process.env['NODE_ENV'] === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

// Helper function to handle Prisma-specific errors
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002':
      const field = err.meta?.target?.[0] || 'field';
      return AppError.conflict(`${field} already exists`, 'DUPLICATE_FIELD', { field });
    
    case 'P2003':
      return AppError.badRequest('Referenced record does not exist', 'FOREIGN_KEY_CONSTRAINT');
    
    case 'P2025':
      return AppError.notFound('Record not found', 'RECORD_NOT_FOUND');
    
    case 'P2021':
      return AppError.internal('Database table does not exist', 'TABLE_NOT_FOUND');
    
    case 'P2022':
      return AppError.internal('Database column does not exist', 'COLUMN_NOT_FOUND');
    
    case 'P2014':
      return AppError.badRequest('Invalid ID provided', 'INVALID_ID');
    
    case 'P2015':
      return AppError.notFound('Related record not found', 'RELATED_RECORD_NOT_FOUND');
    
    case 'P2016':
      return AppError.badRequest('Query interpretation error', 'QUERY_INTERPRETATION_ERROR');
    
    case 'P2017':
      return AppError.badRequest('Relation connection error', 'RELATION_CONNECTION_ERROR');
    
    case 'P2018':
      return AppError.badRequest('Connected records not found', 'CONNECTED_RECORDS_NOT_FOUND');
    
    case 'P2019':
      return AppError.badRequest('Input error', 'INPUT_ERROR');
    
    case 'P2020':
      return AppError.badRequest('Value out of range', 'VALUE_OUT_OF_RANGE');
    
    case 'P2023':
      return AppError.badRequest('Invalid data provided', 'INVALID_DATA');
    
    case 'P2024':
      return AppError.serviceUnavailable('Database connection timeout', 'CONNECTION_TIMEOUT');
    
    default:
      return AppError.internal('Database operation failed', 'DATABASE_ERROR');
  }
}

// Async error wrapper for controllers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.notFound(`Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
  next(error);
}; 