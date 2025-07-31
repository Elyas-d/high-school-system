import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dtoObject = plainToClass(dtoClass, req.body);
      
      // Validate the object
      const errors = await validate(dtoObject);
      
      if (errors.length > 0) {
        // Format validation errors
        const validationErrors = errors.map(error => ({
          property: error.property,
          constraints: error.constraints,
        }));
        
        return res.status(400).json({
          statusCode: 400,
          message: 'Validation failed',
          errors: validationErrors,
        });
      }
      
      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid request data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
} 