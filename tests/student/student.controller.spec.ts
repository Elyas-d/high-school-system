import request from 'supertest';
import { app } from '../../src/index';
import { prisma, createTestUsers, createTestGradeLevel, createTestSubject, createTestTeacher, createTestClass, createTestStudent } from '../utils/test-utils';
import { UserRole } from '@prisma/client';

describe('Student Controller', () => {
  let testUsers: any;
  let testData: any;

  beforeEach(async () => {
    testUsers = await createTestUsers();
    
    // Create test data
    const gradeLevel = await createTestGradeLevel();
    const subject = await createTestSubject(gradeLevel.id);
    const teacher = await createTestTeacher(testUsers.teacher.id);
    const classData = await createTestClass(subject.id, teacher.id);
    
    testData = {
      gradeLevel,
      subject,
      teacher,
      class: classData,
    };
  });

  describe('GET /api/students', () => {
    beforeEach(async () => {
      // Create test students
      const studentUser1 = await createTestUser(UserRole.STUDENT, 'student1@example.com');
      const studentUser2 = await createTestUser(UserRole.STUDENT, 'student2@example.com');
      
      await prisma.student.createMany({
        data: [
          {
            userId: studentUser1.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: testData.class.id,
          },
          {
            userId: studentUser2.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: null,
          },
        ],
      });
    });

    it('should return all students for admin', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Students retrieved successfully');
      expect(response.body.data.data).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.data.length).toBe(2);
    });

    it('should return all students for staff', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${testUsers.staff.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
    });

    it('should return all students for teacher', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${testUsers.teacher.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/students')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/students?page=1&limit=1')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/students?search=student1')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].user.email).toContain('student1');
    });

    it('should handle grade level filter', async () => {
      const response = await request(app)
        .get(`/api/students?gradeLevelId=${testData.gradeLevel.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.data[0].gradeLevel.id).toBe(testData.gradeLevel.id);
    });

    it('should handle class filter', async () => {
      const response = await request(app)
        .get(`/api/students?classId=${testData.class.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].class.id).toBe(testData.class.id);
    });
  });

  describe('GET /api/students/:id', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'getbyid@example.com');
      testStudent = await createTestStudent(studentUser.id, testData.gradeLevel.id, testData.class.id);
    });

    it('should return student by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testStudent.id);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.gradeLevel).toBeDefined();
      expect(response.body.data.class).toBeDefined();
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/students', () => {
    let studentUser: any;

    beforeEach(async () => {
      studentUser = await createTestUser(UserRole.STUDENT, 'create@example.com');
    });

    it('should create student successfully for admin', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
        classId: testData.class.id,
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student created successfully');
      expect(response.body.data.userId).toBe(studentData.userId);
      expect(response.body.data.gradeLevelId).toBe(studentData.gradeLevelId);
      expect(response.body.data.classId).toBe(studentData.classId);
    });

    it('should return 403 for non-admin users', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(studentData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should validate required fields', async () => {
      const studentData = {
        userId: studentUser.id,
        // Missing gradeLevelId
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User ID and Grade Level ID are required');
    });

    it('should handle non-existent user', async () => {
      const studentData = {
        userId: 'non-existent-user-id',
        gradeLevelId: testData.gradeLevel.id,
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle non-existent grade level', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: 'non-existent-grade-level',
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Grade level not found');
    });

    it('should handle non-existent class', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
        classId: 'non-existent-class',
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Class not found');
    });

    it('should handle user with wrong role', async () => {
      const teacherUser = await createTestUser(UserRole.TEACHER, 'teacher@example.com');
      
      const studentData = {
        userId: teacherUser.id,
        gradeLevelId: testData.gradeLevel.id,
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User must have STUDENT role');
    });

    it('should handle duplicate student', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
      };

      // Create first student
      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(201);

      // Try to create second student with same user
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(studentData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student already exists for this user');
    });
  });

  describe('PUT /api/students/:id', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'update@example.com');
      testStudent = await createTestStudent(studentUser.id, testData.gradeLevel.id, testData.class.id);
    });

    it('should update student successfully for admin', async () => {
      const updateData = {
        classId: null, // Remove from class
      };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student updated successfully');
      expect(response.body.data.classId).toBeNull();
    });

    it('should return 404 for non-existent student', async () => {
      const updateData = { classId: null };

      const response = await request(app)
        .put('/api/students/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 403 for non-admin users', async () => {
      const updateData = { classId: null };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should handle non-existent grade level', async () => {
      const updateData = { gradeLevelId: 'non-existent-grade-level' };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Grade level not found');
    });

    it('should handle non-existent class', async () => {
      const updateData = { classId: 'non-existent-class' };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Class not found');
    });
  });

  describe('DELETE /api/students/:id', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'delete@example.com');
      testStudent = await createTestStudent(studentUser.id, testData.gradeLevel.id);
    });

    it('should delete student successfully for admin', async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student deleted successfully');

      // Verify student was deleted
      const deletedStudent = await prisma.student.findUnique({
        where: { id: testStudent.id },
      });
      expect(deletedStudent).toBeNull();
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .delete('/api/students/non-existent-id')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/students/grade-level/:gradeLevelId', () => {
    beforeEach(async () => {
      // Create students in different grade levels
      const studentUser1 = await createTestUser(UserRole.STUDENT, 'grade1@example.com');
      const studentUser2 = await createTestUser(UserRole.STUDENT, 'grade2@example.com');
      
      const gradeLevel2 = await createTestGradeLevel();
      
      await prisma.student.createMany({
        data: [
          {
            userId: studentUser1.id,
            gradeLevelId: testData.gradeLevel.id,
          },
          {
            userId: studentUser2.id,
            gradeLevelId: gradeLevel2.id,
          },
        ],
      });
    });

    it('should return students by grade level', async () => {
      const response = await request(app)
        .get(`/api/students/grade-level/${testData.gradeLevel.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].gradeLevel.id).toBe(testData.gradeLevel.id);
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get(`/api/students/grade-level/${testData.gradeLevel.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/students/class/:classId', () => {
    beforeEach(async () => {
      // Create students in different classes
      const studentUser1 = await createTestUser(UserRole.STUDENT, 'class1@example.com');
      const studentUser2 = await createTestUser(UserRole.STUDENT, 'class2@example.com');
      
      const subject2 = await createTestSubject(testData.gradeLevel.id);
      const class2 = await createTestClass(subject2.id, testData.teacher.id);
      
      await prisma.student.createMany({
        data: [
          {
            userId: studentUser1.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: testData.class.id,
          },
          {
            userId: studentUser2.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: class2.id,
          },
        ],
      });
    });

    it('should return students by class', async () => {
      const response = await request(app)
        .get(`/api/students/class/${testData.class.id}`)
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].class.id).toBe(testData.class.id);
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get(`/api/students/class/${testData.class.id}`)
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/students/search', () => {
    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'search@example.com');
      await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
        },
      });
    });

    it('should search students', async () => {
      const response = await request(app)
        .get('/api/students/search?q=search')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].user.email).toContain('search');
    });

    it('should return 400 for missing search query', async () => {
      const response = await request(app)
        .get('/api/students/search')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search query is required');
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get('/api/students/search?q=search')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/students/stats', () => {
    beforeEach(async () => {
      // Create students for statistics
      const studentUser1 = await createTestUser(UserRole.STUDENT, 'stats1@example.com');
      const studentUser2 = await createTestUser(UserRole.STUDENT, 'stats2@example.com');
      
      await prisma.student.createMany({
        data: [
          {
            userId: studentUser1.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: testData.class.id,
          },
          {
            userId: studentUser2.id,
            gradeLevelId: testData.gradeLevel.id,
            classId: null,
          },
        ],
      });
    });

    it('should return student statistics', async () => {
      const response = await request(app)
        .get('/api/students/stats')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalStudents).toBe(2);
      expect(response.body.data.studentsWithClass).toBe(1);
      expect(response.body.data.studentsWithoutClass).toBe(1);
    });

    it('should return 403 for student users', async () => {
      const response = await request(app)
        .get('/api/students/stats')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/students/profile', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'profile@example.com');
      testStudent = await createTestStudent(studentUser.id, testData.gradeLevel.id, testData.class.id);
    });

    it('should return current student profile', async () => {
      const response = await request(app)
        .get('/api/students/profile')
        .set('Authorization', `Bearer ${testUsers.student.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testStudent.id);
      expect(response.body.data.user.email).toBe('profile@example.com');
    });

    it('should return 404 for non-student users', async () => {
      const response = await request(app)
        .get('/api/students/profile')
        .set('Authorization', `Bearer ${testUsers.admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student profile not found');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/students/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });
}); 