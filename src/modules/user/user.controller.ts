import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import userService, { CreateUserData, UpdateUserData, PaginationOptions } from './user.service';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class UserController {
  /**
   * Get all users (Admin only)
   * GET /users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, role } = req.query;
      
      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: (search as string) || '',
        role: role as any,
      };

      const result = await userService.getAllUsers(options);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
      });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve user',
        });
      }
    }
  }

  /**
   * Create new user (Admin only)
   * POST /users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserData = req.body;

      // Validate required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.role) {
        res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = await userService.createUser({
        ...userData,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      console.error('Create user error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create user',
        });
      }
    }
  }

  /**
   * Update user by ID
   * PUT /users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserData = req.body;

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          res.status(400).json({
            success: false,
            message: 'Invalid email format',
          });
          return;
        }
      }

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      } else if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update user',
        });
      }
    }
  }

  /**
   * Delete user by ID (Admin only)
   * DELETE /users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete user',
        });
      }
    }
  }

  /**
   * Get users by role
   * GET /users/role/:role
   */
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const { page, limit, search } = req.query;

      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        role: role as any,
      };

      const result = await userService.getUsersByRole(role as any, options);

      res.status(200).json({
        success: true,
        message: `Users with role ${role} retrieved successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users by role',
      });
    }
  }

  /**
   * Search users
   * GET /users/search
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q, page, limit, role } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: q as string,
        role: role as any,
      };

      const result = await userService.searchUsers(q as string, options);

      res.status(200).json({
        success: true,
        message: 'Users search completed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
      });
    }
  }

  /**
   * Get user statistics (Admin only)
   * GET /users/stats
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await userService.getUserStatistics();

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get user statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
      });
    }
  }

  /**
   * Get current user profile
   * GET /users/profile
   */
  async getCurrentUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await userService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Get current user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
      });
    }
  }

  /**
   * Update current user profile
   * PUT /users/profile
   */
  async updateCurrentUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const updateData: UpdateUserData = req.body;

      // Remove sensitive fields that shouldn't be updated via profile
      delete (updateData as any).role;
      delete (updateData as any).email; // Email changes should go through a separate process

      const user = await userService.updateUser(req.user.userId, updateData);

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update current user profile error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update user profile',
        });
      }
    }
  }
}

export default new UserController(); 