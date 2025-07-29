import { Request, Response, NextFunction } from 'express';

// Define the expected shape of req.user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  } | undefined;
}

export function authorize(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: `Forbidden: User role '${user.role}' is not allowed to access this resource`,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
} 