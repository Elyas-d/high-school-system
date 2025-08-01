import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { RegisterRequest, LoginRequest } from '../types/auth.types';

export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;

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

      // Validate password strength
      if (userData.password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
        return;
      }

      const result = await authService.register(userData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await authService.login(loginData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const result = await authService.getCurrentUser(token);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Get current user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      if (result) {
        res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: result,
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }
    } catch (error) {
      console.error('Refresh token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Google OAuth callback
   * GET /auth/google/callback
   */
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      // This will be handled by passport middleware
      // The user profile will be available in req.user
      const profile = req.user as any;

      if (!profile) {
        res.status(400).json({
          success: false,
          message: 'Failed to authenticate with Google',
        });
        return;
      }

      const result = await authService.handleGoogleOAuth(profile);

      if (result.success && result.data) {
        // Redirect to frontend with tokens
        const redirectUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/auth/callback?` +
          `accessToken=${result.data.accessToken}&` +
          `refreshToken=${result.data.refreshToken}&` +
          `user=${encodeURIComponent(JSON.stringify(result.data.user))}`;
        
        res.redirect(redirectUrl);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /auth/logout
   */
  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new AuthController(); 