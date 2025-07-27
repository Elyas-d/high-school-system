import { UserService } from '../../src/modules/user/user.service';
import { prisma, createTestUser, createTestUsers } from '../utils/test-utils';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('User Service', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('getAllUsers', () => {
    beforeEach(async () => {
      // Create test users
      await createTestUsers();
    });

    it('should return all users with pagination', async () => {
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(5); // 5 test users
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter users by role', async () => {
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        role: UserRole.STUDENT,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].role).toBe(UserRole.STUDENT);
    });

    it('should search users by name or email', async () => {
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        search: 'admin',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].email).toContain('admin');
    });

    it('should handle empty search results', async () => {
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        search: 'nonexistent',
      });

      expect(result.data.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      // Create more users for pagination testing
      for (let i = 0; i < 15; i++) {
        await createTestUser(UserRole.STUDENT, `student${i}@example.com`);
      }

      const result = await userService.getAllUsers({
        page: 2,
        limit: 10,
      });

      expect(result.data.length).toBe(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('getUserById', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'getbyid@example.com');
    });

    it('should return user by ID with related data', async () => {
      const user = await userService.getUserById(testUser.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(testUser.id);
      expect(user.email).toBe(testUser.email);
      expect(user.role).toBe(testUser.role);
      expect(user.password).toBeUndefined(); // Password should not be returned
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.getUserById('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'create@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.password).toBeUndefined();

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(userData.email);
      
      // Verify password was hashed
      const isValidPassword = await bcrypt.compare(userData.password, dbUser?.password || '');
      expect(isValidPassword).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
      };

      // Create first user
      await userService.createUser(userData);

      // Try to create second user with same email
      await expect(userService.createUser(userData)).rejects.toThrow('User with this email already exists');
    });

    it('should handle optional phone number', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'nophone@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
        // phoneNumber is optional
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.phoneNumber).toBeNull();
    });
  });

  describe('updateUser', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'update@example.com');
    });

    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+9876543210',
      };

      const updatedUser = await userService.updateUser(testUser.id, updateData);

      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
      expect(updatedUser.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should throw error for non-existent user', async () => {
      const updateData = { firstName: 'Updated' };

      await expect(userService.updateUser('non-existent-id', updateData)).rejects.toThrow('User not found');
    });

    it('should throw error for duplicate email', async () => {
      // Create another user
      const otherUser = await createTestUser(UserRole.STUDENT, 'other@example.com');

      const updateData = { email: otherUser.email };

      await expect(userService.updateUser(testUser.id, updateData)).rejects.toThrow('Email already exists');
    });

    it('should allow updating to same email', async () => {
      const updateData = { firstName: 'Updated' };

      const updatedUser = await userService.updateUser(testUser.id, updateData);

      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.email).toBe(testUser.email); // Email unchanged
    });
  });

  describe('deleteUser', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser(UserRole.STUDENT, 'delete@example.com');
    });

    it('should delete user successfully', async () => {
      await userService.deleteUser(testUser.id);

      // Verify user was deleted
      const dbUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(dbUser).toBeNull();
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.deleteUser('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('getUsersByRole', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    it('should return users filtered by role', async () => {
      const result = await userService.getUsersByRole(UserRole.STUDENT, {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].role).toBe(UserRole.STUDENT);
    });

    it('should handle empty results for role', async () => {
      const result = await userService.getUsersByRole(UserRole.STUDENT, {
        page: 1,
        limit: 10,
        search: 'nonexistent',
      });

      expect(result.data.length).toBe(0);
    });
  });

  describe('searchUsers', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    it('should search users by name or email', async () => {
      const result = await userService.searchUsers('admin', {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].email).toContain('admin');
    });

    it('should handle case-insensitive search', async () => {
      const result = await userService.searchUsers('ADMIN', {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].email).toContain('admin');
    });
  });

  describe('getUserStatistics', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    it('should return user statistics', async () => {
      const stats = await userService.getUserStatistics();

      expect(stats.totalUsers).toBe(5);
      expect(stats.roleCounts).toBeDefined();
      expect(stats.roleCounts[UserRole.ADMIN]).toBe(1);
      expect(stats.roleCounts[UserRole.STAFF]).toBe(1);
      expect(stats.roleCounts[UserRole.TEACHER]).toBe(1);
      expect(stats.roleCounts[UserRole.STUDENT]).toBe(1);
      expect(stats.roleCounts[UserRole.PARENT]).toBe(1);
    });

    it('should handle empty database', async () => {
      // Clear all users
      await prisma.user.deleteMany();

      const stats = await userService.getUserStatistics();

      expect(stats.totalUsers).toBe(0);
      expect(stats.roleCounts).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle null phone number correctly', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'nullphone@example.com',
        password: 'securepassword123',
        role: UserRole.STUDENT,
        phoneNumber: null,
      };

      const user = await userService.createUser(userData);

      expect(user.phoneNumber).toBeNull();
    });

    it('should handle special characters in search', async () => {
      await createTestUser(UserRole.STUDENT, 'test@example.com');

      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        search: '@example',
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle very large search terms', async () => {
      const longSearchTerm = 'a'.repeat(1000);

      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        search: longSearchTerm,
      });

      expect(result.data.length).toBe(0);
    });
  });
}); 