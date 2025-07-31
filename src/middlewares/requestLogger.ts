import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  // Log the incoming request
  logger.http(`${req.method} ${req.path} - ${req.ip}`);
  
  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(this: Response, chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log the response
    logger.http(`${req.method} ${req.path} - ${statusCode} - ${duration}ms`);
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
}; 