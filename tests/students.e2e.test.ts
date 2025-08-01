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

// Import your app setup
import routes from '../src/routes';
import { errorHandler, notFoundHandler } from '../src/middlewares/errorHandler';
import '../src/config/passport';

describe('Students E2E Tests', () => {
  let app: express.Application;
  let server: any;
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let parentToken: string;
  let staffToken: string;

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
        secure: false,
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
    
    // Create test users and generate tokens
    const adminUser = await TestUtils.createTestUser(UserRole.ADMIN, 'admin@test.com');
    const teacherUser = await TestUtils.createTestUser(UserRole.TEACHER, 'teacher@test.com');
    const studentUser = await TestUtils.createTestUser(UserRole.STUDENT, 'student@test.com');
    const parentUser = await TestUtils.createTestUser(UserRole.PARENT, 'parent@test.com');
    const staffUser = await TestUtils.createTestUser(UserRole.STAFF, 'staff@test.com');
    
    adminToken = TestUtils.generateToken(adminUser);
    teacherToken = TestUtils.generateToken(teacherUser);
    studentToken = TestUtils.generateToken(studentUser);
    parentToken = TestUtils.generateToken(parentUser);
    staffToken = TestUtils.generateToken(staffUser);
  });

  describe('GET /api/students', () => {
    it('should allow ADMIN to get all students', async () => {
      // Create some test students
      await TestUtils.createTestStudent();
      await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get('/api/students')
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow TEACHER to get all students', async () => {
      // Create some test students
      await TestUtils.createTestStudent();
      await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get('/api/students')
        .set(TestUtils.createAuthHeaders(teacherToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow STAFF to get all students', async () => {
      // Create some test students
      await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get('/api/students')
        .set(TestUtils.createAuthHeaders(staffToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should deny STUDENT access to get all students', async () => {
      const response = await request(app)
        .get('/api/students')
        .set(TestUtils.createAuthHeaders(studentToken))
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should deny PARENT access to get all students', async () => {
      const response = await request(app)
        .get('/api/students')
        .set(TestUtils.createAuthHeaders(parentToken))
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/students')
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });

    it('should support pagination', async () => {
      // Create multiple students
      for (let i = 0; i < 5; i++) {
        await TestUtils.createTestStudent();
      }
      
      const response = await request(app)
        .get('/api/students?page=1&limit=3')
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should allow ADMIN to get student by ID', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testStudent.student.id);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email');
    });

    it('should allow TEACHER to get student by ID', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(teacherToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id')
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(404);

      TestUtils.validateErrorResponse(response, 404);
    });

    it('should require authentication', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const response = await request(app)
        .get(`/api/students/${testStudent.student.id}`)
        .expect(401);

      TestUtils.validateErrorResponse(response, 401);
    });
  });

  describe('POST /api/students', () => {
    it('should allow ADMIN to create a new student', async () => {
      const testStudent = await TestUtils.createTestStudent();
      const newUser = await TestUtils.createTestUser(UserRole.STUDENT, 'newstudent@example.com');
      
      const createPayload = {
        userId: newUser.id,
        gradeLevelId: testStudent.gradeLevel.id,
        classId: testStudent.classRecord.id,
        enrollmentDate: new Date().toISOString(),
        studentId: 'STU001',
      };

      const response = await request(app)
        .post('/api/students')
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(createPayload)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('studentId', 'STU001');
    });

    it('should deny TEACHER from creating students', async () => {
      const testStudent = await TestUtils.createTestStudent();
      const newUser = await TestUtils.createTestUser(UserRole.STUDENT, 'newstudent@example.com');
      
      const createPayload = {
        userId: newUser.id,
        gradeLevelId: testStudent.gradeLevel.id,
        classId: testStudent.classRecord.id,
        enrollmentDate: new Date().toISOString(),
        studentId: 'STU002',
      };

      const response = await request(app)
        .post('/api/students')
        .set(TestUtils.createAuthHeaders(teacherToken))
        .send(createPayload)
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should validate required fields', async () => {
      const createPayload = {
        // Missing required fields
        studentId: 'STU003',
      };

      const response = await request(app)
        .post('/api/students')
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(createPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });

    it('should prevent duplicate student IDs', async () => {
      const testStudent = await TestUtils.createTestStudent();
      const newUser = await TestUtils.createTestUser(UserRole.STUDENT, 'newstudent@example.com');
      
      const createPayload = {
        userId: newUser.id,
        gradeLevelId: testStudent.gradeLevel.id,
        classId: testStudent.classRecord.id,
        enrollmentDate: new Date().toISOString(),
        studentId: testStudent.student.studentId, // Duplicate ID
      };

      const response = await request(app)
        .post('/api/students')
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(createPayload)
        .expect(409);

      TestUtils.validateErrorResponse(response, 409);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should allow ADMIN to update student', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const updatePayload = {
        studentId: 'STU_UPDATED',
        enrollmentDate: new Date().toISOString(),
      };

      const response = await request(app)
        .put(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(updatePayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('studentId', 'STU_UPDATED');
    });

    it('should deny TEACHER from updating students', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const updatePayload = {
        studentId: 'STU_UPDATED',
      };

      const response = await request(app)
        .put(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(teacherToken))
        .send(updatePayload)
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should return 404 for non-existent student', async () => {
      const updatePayload = {
        studentId: 'STU_UPDATED',
      };

      const response = await request(app)
        .put('/api/students/non-existent-id')
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(updatePayload)
        .expect(404);

      TestUtils.validateErrorResponse(response, 404);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should allow ADMIN to delete student', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const response = await request(app)
        .delete(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should deny TEACHER from deleting students', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const response = await request(app)
        .delete(`/api/students/${testStudent.student.id}`)
        .set(TestUtils.createAuthHeaders(teacherToken))
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .delete('/api/students/non-existent-id')
        .set(TestUtils.createAuthHeaders(adminToken))
        .expect(404);

      TestUtils.validateErrorResponse(response, 404);
    });
  });

  describe('POST /api/students/:id/assign-parent', () => {
    it('should allow ADMIN to assign parent to student', async () => {
      const testStudent = await TestUtils.createTestStudent();
      const parentUser = await TestUtils.createTestUser(UserRole.PARENT, 'parent@example.com');
      
      const assignPayload = {
        parentId: parentUser.id,
      };

      const response = await request(app)
        .post(`/api/students/${testStudent.student.id}/assign-parent`)
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(assignPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should deny TEACHER from assigning parents', async () => {
      const testStudent = await TestUtils.createTestStudent();
      const parentUser = await TestUtils.createTestUser(UserRole.PARENT, 'parent@example.com');
      
      const assignPayload = {
        parentId: parentUser.id,
      };

      const response = await request(app)
        .post(`/api/students/${testStudent.student.id}/assign-parent`)
        .set(TestUtils.createAuthHeaders(teacherToken))
        .send(assignPayload)
        .expect(403);

      TestUtils.validateErrorResponse(response, 403);
    });

    it('should validate parent ID', async () => {
      const testStudent = await TestUtils.createTestStudent();
      
      const assignPayload = {
        parentId: 'non-existent-parent-id',
      };

      const response = await request(app)
        .post(`/api/students/${testStudent.student.id}/assign-parent`)
        .set(TestUtils.createAuthHeaders(adminToken))
        .send(assignPayload)
        .expect(400);

      TestUtils.validateErrorResponse(response, 400);
    });
  });
}); 