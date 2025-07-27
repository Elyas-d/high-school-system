import request from 'supertest';
import { app } from '../../src/index';
import { prisma, createTestUsers, makeAuthenticatedRequest, testProtectedRoute } from '../utils/test-utils';
import { UserRole } from '@prisma/client';

describe('User Controller', () => {
  let testUsers: any;

  beforeEach(async () => {
    testUsers = await createTestUsers();
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Users retrieved successfully');
      expect(response.body.data.data).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.data.length).toBe(5); // 5 test users
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].email).toContain('admin');
    });

    it('should handle role filter', async () => {
      const response = await request(app)
        .get('/api/users?role=STUDENT')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].role).toBe('STUDENT');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${testUsers.student.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUsers.student.id);
      expect(response.body.data.email).toBe(testUsers.student.email);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/users/${testUsers.admin.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/users', () => {
    it('should create user successfully for admin', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 403 for non-admin users', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should validate required fields', async () => {
      const userData = {
        firstName: 'New',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All required fields must be provided');
    });

    it('should validate email format', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'invalid-email',
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should validate password length', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: '123', // Too short
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });

    it('should handle duplicate email', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: testUsers.student.email, // Existing email
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully for admin', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+9876543210',
      };

      const response = await request(app)
        .put(`/api/users/${testUsers.student.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = { firstName: 'Updated' };

      const response = await request(app)
        .put('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 403 for non-admin users', async () => {
      const updateData = { firstName: 'Updated' };

      const response = await request(app)
        .put(`/api/users/${testUsers.admin.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should validate email format when updating', async () => {
      const updateData = { email: 'invalid-email' };

      const response = await request(app)
        .put(`/api/users/${testUsers.student.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should handle duplicate email when updating', async () => {
      const updateData = { email: testUsers.admin.email }; // Existing email

      const response = await request(app)
        .put(`/api/users/${testUsers.student.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully for admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUsers.student.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user was deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUsers.student.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUsers.admin.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/users/role/:role', () => {
    it('should return users by role for admin', async () => {
      const response = await request(app)
        .get('/api/users/role/STUDENT')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].role).toBe('STUDENT');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/role/STUDENT')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users for admin', async () => {
      const response = await request(app)
        .get('/api/users/search?q=admin')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].email).toContain('admin');
    });

    it('should return 400 for missing search query', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search query is required');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/search?q=admin')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/users/stats', () => {
    it('should return user statistics for admin', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBe(5);
      expect(response.body.data.roleCounts).toBeDefined();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUsers.student.id);
      expect(response.body.data.email).toBe(testUsers.student.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update current user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+9876543210',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should not allow updating role via profile', async () => {
      const updateData = {
        firstName: 'Updated',
        role: UserRole.ADMIN, // Should be ignored
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.role).toBe('STUDENT'); // Role should remain unchanged
    });

    it('should return 401 without token', async () => {
      const updateData = { firstName: 'Updated' };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Protected Route Testing', () => {
    it('should test all protected routes with proper authorization', async () => {
      const routes = [
        { method: 'GET', url: '/api/users', allowedRoles: [UserRole.ADMIN] },
        { method: 'GET', url: '/api/users/stats', allowedRoles: [UserRole.ADMIN] },
        { method: 'GET', url: '/api/users/search', allowedRoles: [UserRole.ADMIN, UserRole.STAFF] },
        { method: 'GET', url: '/api/users/role/STUDENT', allowedRoles: [UserRole.ADMIN, UserRole.STAFF] },
      ];

      for (const route of routes) {
        await testProtectedRoute(
          request(app),
          route.method,
          route.url,
          testUsers,
          200,
          route.allowedRoles
        );
      }
    });
  });
}); 