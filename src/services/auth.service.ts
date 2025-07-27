import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';
import {
  RegisterRequest,
  LoginRequest,
  JWTPayload,
  AuthResponse,
  TokenResponse,
  GoogleProfile,
} from '../types/auth.types';

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
    this.JWT_EXPIRES_IN = '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = '7d';
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          phoneNumber: userData.phoneNumber || null,
          role: userData.role,
        },
      });

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Failed to register user',
      };
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to login',
      };
    }
  }

  /**
   * Get current user from JWT token
   */
  async getCurrentUser(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          accessToken: token,
        },
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  /**
   * Handle Google OAuth login
   */
  async handleGoogleOAuth(profile: GoogleProfile): Promise<AuthResponse> {
    try {
      const email = profile.emails[0]?.value;
      
      if (!email) {
        return {
          success: false,
          message: 'Email not provided by Google',
        };
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create new user from Google profile
        user = await prisma.user.create({
          data: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email,
            password: '', // No password for OAuth users
            role: UserRole.STUDENT, // Default role, can be changed later
          },
        });
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Google OAuth login successful',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        message: 'Failed to process Google OAuth login',
      };
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, email: string, role: UserRole): TokenResponse {
    const payload: JWTPayload = {
      userId,
      email,
      role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as JWTPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return null;
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService(); 