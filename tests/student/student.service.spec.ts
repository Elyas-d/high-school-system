import { StudentService } from '../../src/modules/student/student.service';
import { prisma, createTestUser, createTestGradeLevel, createTestSubject, createTestClass, createTestTeacher } from '../utils/test-utils';
import { UserRole } from '@prisma/client';

describe('Student Service', () => {
  let studentService: StudentService;
  let testData: any;

  beforeEach(async () => {
    studentService = new StudentService();
    
    // Create test data
    const gradeLevel = await createTestGradeLevel();
    const subject = await createTestSubject(gradeLevel.id);
    const teacher = await createTestTeacher((await createTestUser(UserRole.TEACHER)).id);
    const classData = await createTestClass(subject.id, teacher.id);
    
    testData = {
      gradeLevel,
      subject,
      teacher,
      class: classData,
    };
  });

  describe('getAllStudents', () => {
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
            classId: null, // No class assigned
          },
        ],
      });
    });

    it('should return all students with pagination', async () => {
      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter students by grade level', async () => {
      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
        gradeLevelId: testData.gradeLevel.id,
      });

      expect(result.data.length).toBe(2);
      expect(result.data[0].gradeLevel.id).toBe(testData.gradeLevel.id);
    });

    it('should filter students by class', async () => {
      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
        classId: testData.class.id,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].class.id).toBe(testData.class.id);
    });

    it('should search students by name or email', async () => {
      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
        search: 'student1',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].user.email).toContain('student1');
    });

    it('should include related data', async () => {
      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
      });

      expect(result.data[0].user).toBeDefined();
      expect(result.data[0].gradeLevel).toBeDefined();
      expect(result.data[0].class).toBeDefined();
      expect(result.data[0].parents).toBeDefined();
    });
  });

  describe('getStudentById', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'getbyid@example.com');
      testStudent = await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
          classId: testData.class.id,
        },
      });
    });

    it('should return student by ID with all related data', async () => {
      const student = await studentService.getStudentById(testStudent.id);

      expect(student).toBeDefined();
      expect(student.id).toBe(testStudent.id);
      expect(student.user).toBeDefined();
      expect(student.gradeLevel).toBeDefined();
      expect(student.class).toBeDefined();
      expect(student.grades).toBeDefined();
      expect(student.attendances).toBeDefined();
      expect(student.submissions).toBeDefined();
      expect(student.parents).toBeDefined();
    });

    it('should throw error for non-existent student', async () => {
      await expect(studentService.getStudentById('non-existent-id')).rejects.toThrow('Student not found');
    });
  });

  describe('createStudent', () => {
    let studentUser: any;

    beforeEach(async () => {
      studentUser = await createTestUser(UserRole.STUDENT, 'create@example.com');
    });

    it('should create a new student successfully', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
        classId: testData.class.id,
      };

      const student = await studentService.createStudent(studentData);

      expect(student).toBeDefined();
      expect(student.userId).toBe(studentData.userId);
      expect(student.gradeLevelId).toBe(studentData.gradeLevelId);
      expect(student.classId).toBe(studentData.classId);
      expect(student.user).toBeDefined();
      expect(student.gradeLevel).toBeDefined();
      expect(student.class).toBeDefined();
    });

    it('should create student without class assignment', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
        // classId is optional
      };

      const student = await studentService.createStudent(studentData);

      expect(student).toBeDefined();
      expect(student.classId).toBeNull();
    });

    it('should throw error for non-existent user', async () => {
      const studentData = {
        userId: 'non-existent-user-id',
        gradeLevelId: testData.gradeLevel.id,
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('User not found');
    });

    it('should throw error for user with wrong role', async () => {
      const teacherUser = await createTestUser(UserRole.TEACHER, 'teacher@example.com');
      
      const studentData = {
        userId: teacherUser.id,
        gradeLevelId: testData.gradeLevel.id,
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('User must have STUDENT role');
    });

    it('should throw error for non-existent grade level', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: 'non-existent-grade-level',
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('Grade level not found');
    });

    it('should throw error for non-existent class', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
        classId: 'non-existent-class',
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('Class not found');
    });

    it('should throw error for duplicate student', async () => {
      const studentData = {
        userId: studentUser.id,
        gradeLevelId: testData.gradeLevel.id,
      };

      // Create first student
      await studentService.createStudent(studentData);

      // Try to create second student with same user
      await expect(studentService.createStudent(studentData)).rejects.toThrow('Student already exists for this user');
    });
  });

  describe('updateStudent', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'update@example.com');
      testStudent = await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
          classId: testData.class.id,
        },
      });
    });

    it('should update student successfully', async () => {
      const updateData = {
        classId: null, // Remove from class
      };

      const updatedStudent = await studentService.updateStudent(testStudent.id, updateData);

      expect(updatedStudent).toBeDefined();
      expect(updatedStudent.classId).toBeNull();
    });

    it('should throw error for non-existent student', async () => {
      const updateData = { classId: null };

      await expect(studentService.updateStudent('non-existent-id', updateData)).rejects.toThrow('Student not found');
    });

    it('should throw error for non-existent grade level', async () => {
      const updateData = { gradeLevelId: 'non-existent-grade-level' };

      await expect(studentService.updateStudent(testStudent.id, updateData)).rejects.toThrow('Grade level not found');
    });

    it('should throw error for non-existent class', async () => {
      const updateData = { classId: 'non-existent-class' };

      await expect(studentService.updateStudent(testStudent.id, updateData)).rejects.toThrow('Class not found');
    });
  });

  describe('deleteStudent', () => {
    let testStudent: any;

    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'delete@example.com');
      testStudent = await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
        },
      });
    });

    it('should delete student successfully', async () => {
      await studentService.deleteStudent(testStudent.id);

      // Verify student was deleted
      const deletedStudent = await prisma.student.findUnique({
        where: { id: testStudent.id },
      });
      expect(deletedStudent).toBeNull();
    });

    it('should throw error for non-existent student', async () => {
      await expect(studentService.deleteStudent('non-existent-id')).rejects.toThrow('Student not found');
    });
  });

  describe('getStudentsByGradeLevel', () => {
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
      const result = await studentService.getStudentsByGradeLevel(testData.gradeLevel.id, {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].gradeLevel.id).toBe(testData.gradeLevel.id);
    });
  });

  describe('getStudentsByClass', () => {
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
      const result = await studentService.getStudentsByClass(testData.class.id, {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].class.id).toBe(testData.class.id);
    });
  });

  describe('searchStudents', () => {
    beforeEach(async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'search@example.com');
      await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
        },
      });
    });

    it('should search students by name or email', async () => {
      const result = await studentService.searchStudents('search', {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].user.email).toContain('search');
    });
  });

  describe('getStudentStatistics', () => {
    beforeEach(async () => {
      // Create students in different grade levels and classes
      const studentUser1 = await createTestUser(UserRole.STUDENT, 'stats1@example.com');
      const studentUser2 = await createTestUser(UserRole.STUDENT, 'stats2@example.com');
      const studentUser3 = await createTestUser(UserRole.STUDENT, 'stats3@example.com');
      
      const gradeLevel2 = await createTestGradeLevel();
      
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
            classId: null, // No class
          },
          {
            userId: studentUser3.id,
            gradeLevelId: gradeLevel2.id,
            classId: null, // No class
          },
        ],
      });
    });

    it('should return student statistics', async () => {
      const stats = await studentService.getStudentStatistics();

      expect(stats.totalStudents).toBe(3);
      expect(stats.gradeLevelCounts).toBeDefined();
      expect(stats.studentsWithClass).toBe(1);
      expect(stats.studentsWithoutClass).toBe(2);
    });

    it('should handle empty database', async () => {
      // Clear all students
      await prisma.student.deleteMany();

      const stats = await studentService.getStudentStatistics();

      expect(stats.totalStudents).toBe(0);
      expect(stats.studentsWithClass).toBe(0);
      expect(stats.studentsWithoutClass).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle students without class assignment', async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'noclass@example.com');
      await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
          classId: null,
        },
      });

      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].class).toBeNull();
    });

    it('should handle special characters in search', async () => {
      const studentUser = await createTestUser(UserRole.STUDENT, 'test@example.com');
      await prisma.student.create({
        data: {
          userId: studentUser.id,
          gradeLevelId: testData.gradeLevel.id,
        },
      });

      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
        search: '@example',
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle very large search terms', async () => {
      const longSearchTerm = 'a'.repeat(1000);

      const result = await studentService.getAllStudents({
        page: 1,
        limit: 10,
        search: longSearchTerm,
      });

      expect(result.data.length).toBe(0);
    });
  });
}); 