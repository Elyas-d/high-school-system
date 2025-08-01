import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { TestUtils } from './utils/test-utils';
import { UserRole } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Import your app setup (without starting the server)
import routes from '../src/routes';
import { errorHandler, notFoundHandler } from '../src/middlewares/errorHandler';
import '../src/config/passport';

describe('Authentication E2E Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Clean up database before tests
    await TestUtils.cleanupDatabase();
    
    // Create test app
    app = express();
    
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Session middleware
    app.use(session({
      secret: process.env['SESSION_SECRET'] || 'test-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // false for testing
        maxAge: 24 * 60 * 60 * 1000,
      },
    }));
    
    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Routes
    app.use('/api', routes);
    
    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);
    
    // Start server on test port
    const PORT = process.env['PORT'] || 3001;
    server = app.listen(PORT);
  });

  afterAll(async () => {
    // Clean up
    await TestUtils.cleanupDatabase();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up before each test
    await TestUtils.cleanupDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user first
      await TestUtils.createTestUser(UserRole.ADMIN, 'admin@school.com');
      
      const loginPayload = {
        email: 'admin@school.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'admin@school.com');
      expect(response.body.user).toHaveProperty('role', UserRole.ADMIN);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid email', async () => {
      const loginPayload = {
        email: 'nonexistent@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      // Create a test user first
      await TestUtils.createTestUser(UserRole.STUDENT, 'student@example.com');
      
      const loginPayload = {
        email: 'student@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with missing email', async () => {
      const loginPayload = {
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });

    it('should fail with missing password', async () => {
      const loginPayload = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });

    it('should fail with invalid email format', async () => {
      const loginPayload = {
        email: 'invalid-email',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'john.doe@example.com');
      expect(response.body.user).toHaveProperty('firstName', 'John');
      expect(response.body.user).toHaveProperty('lastName', 'Doe');
      expect(response.body.user).toHaveProperty('role', UserRole.STUDENT);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      // Create a user first
      await TestUtils.createTestUser(UserRole.STUDENT, 'existing@example.com');
      
      const registerPayload = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.TEACHER,
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(409);

      TestUtils.validateErrorResponse(response, 409);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid role', async () => {
      const registerPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'INVALID_ROLE',
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });

    it('should fail with weak password', async () => {
      const registerPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123', // Too short
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      // Create a test user and generate token
      const testUser = await TestUtils.createTestUser(UserRole.TEACHER, 'teacher@example.com');
      const token = TestUtils.generateToken(testUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set(TestUtils.createAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUser.id);
      expect(response.body.user).toHaveProperty('email', 'teacher@example.com');
      expect(response.body.user).toHaveProperty('role', UserRole.TEACHER);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });

    it('should fail with expired token', async () => {
      // In a real scenario, you'd need to wait for the token to expire
      // For testing, we'll use an obviously invalid token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer expired.invalid.token')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Create a test user and generate token
      const testUser = await TestUtils.createTestUser(UserRole.PARENT, 'parent@example.com');
      const token = TestUtils.generateToken(testUser);

      const response = await request(app)
        .post('/api/auth/logout')
        .set(TestUtils.createAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('logged out');
    });

    it('should handle logout without token gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // Create a test user and generate token
      const testUser = await TestUtils.createTestUser(UserRole.STAFF, 'staff@example.com');
      const token = TestUtils.generateToken(testUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set(TestUtils.createAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUser.id);
    });

    it('should fail to refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });
  });
}); 