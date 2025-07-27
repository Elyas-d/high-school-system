import request from 'supertest';
import { app } from '../../src/index';
import { prisma, createTestUser, generateTestToken } from '../utils/test-utils';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        // Missing email, password, role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All required fields must be provided');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should return 400 for password too short', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123', // Too short
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });

    it('should return 409 for duplicate email', async () => {
      // Create a user first
      await createTestUser(UserRole.STUDENT, 'existing@example.com');

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com', // Same email
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await createTestUser(UserRole.STUDENT, 'login@example.com', 'testpassword');
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'testpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'testpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'me@example.com');
      token = testUser.token;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Current user retrieved successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 401 with expired token', async () => {
      // Create an expired token
      const expiredToken = generateTestToken(testUser.id, testUser.email, testUser.role);
      
      // Mock jwt.verify to simulate expired token
      jest.doMock('jsonwebtoken', () => ({
        verify: jest.fn().mockImplementation(() => {
          throw new Error('TokenExpiredError');
        }),
      }));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token has expired');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'refresh@example.com');
      // In a real implementation, you would get the refresh token from login
      refreshToken = 'valid-refresh-token';
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'logout@example.com');
      token = testUser.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });
  });

  describe('Google OAuth Routes', () => {
    describe('GET /api/auth/google', () => {
      it('should redirect to Google OAuth', async () => {
        const response = await request(app)
          .get('/api/auth/google')
          .expect(302); // Redirect status

        expect(response.headers.location).toContain('accounts.google.com');
      });
    });

    describe('GET /api/auth/google/callback', () => {
      it('should handle Google OAuth callback', async () => {
        // This would require mocking the Google OAuth strategy
        // For now, we'll test that the route exists
        const response = await request(app)
          .get('/api/auth/google/callback')
          .expect(302); // Redirect status

        // The actual implementation would depend on the Google OAuth setup
        expect(response.status).toBeDefined();
      });
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords correctly during registration', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'password@example.com',
        password: 'testpassword123',
        role: UserRole.STUDENT,
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify password was hashed
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user).toBeDefined();
      expect(user?.password).not.toBe(userData.password);
      
      // Verify password can be verified
      const isValid = await bcrypt.compare(userData.password, user?.password || '');
      expect(isValid).toBe(true);
    });
  });

  describe('JWT Token Validation', () => {
    let testUser: any;
    let token: string;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'jwt@example.com');
      token = testUser.token;
    });

    it('should decode JWT token correctly', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.role).toBe(testUser.role);
    });

    it('should handle malformed JWT tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });
}); 