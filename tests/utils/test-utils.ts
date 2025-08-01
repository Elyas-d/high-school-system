import { PrismaClient, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

export class TestUtils {
  private static prisma: PrismaClient;

  static async getPrisma(): Promise<PrismaClient> {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env['DATABASE_URL'] || '',
          },
        },
      });
    }
    return this.prisma;
  }

  static async cleanupDatabase(): Promise<void> {
    const prisma = await this.getPrisma();
    
    // Delete in reverse dependency order
    await prisma.payment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.material.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.parentStudent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.gradeLevel.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.chatSupport.deleteMany();
    await prisma.user.deleteMany();
  }

  static async createTestUser(role: UserRole, email: string, password: string = 'testpassword123'): Promise<any> {
    const prisma = await this.getPrisma();
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        firstName: 'Test',
      lastName: 'User',
        email,
        password: password, // In real tests, this should be hashed
      role,
        phoneNumber: '+1234567890',
    },
  });

    return user;
  }

  static async createTestStudent(email: string = 'student@example.com'): Promise<any> {
    const prisma = await this.getPrisma();
    
    // Create or find grade level
    const gradeLevel = await prisma.gradeLevel.upsert({
      where: { id: 'grade-10-id' },
      update: {},
      create: {
        id: 'grade-10-id',
      name: 'Grade 10',
      description: 'Tenth Grade',
    },
  });

    // Create or find class
    const classRecord = await prisma.class.upsert({
      where: { id: 'class-a-id' },
      update: {},
      create: {
        id: 'class-a-id',
        subjectId: 'subject-math-id',
        teacherId: 'teacher-id',
        schedule: 'Monday 9:00 AM',
        roomNumber: '101',
    },
  });

    // Create user first
    const user = await this.createTestUser(UserRole.STUDENT, email);
    
    // Create student
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        gradeLevelId: gradeLevel.id,
        classId: classRecord.id,
    },
  });

    return { user, student, gradeLevel, class: classRecord };
  }

  static async createTestTeacher(email: string = 'teacher@example.com'): Promise<any> {
    const prisma = await this.getPrisma();
    
    // Create or find subject
    const subject = await prisma.subject.upsert({
      where: { id: 'subject-math-id' },
      update: {},
      create: {
        id: 'subject-math-id',
        name: 'Mathematics',
        description: 'Advanced Mathematics',
        gradeLevelId: 'grade-10-id',
      },
    });

    // Create user first
    const user = await this.createTestUser(UserRole.TEACHER, email);
    
    // Create teacher (Teacher model only has id and userId)
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
    },
  });

    return { user, teacher, subject };
  }

  static generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, process.env['JWT_SECRET'] || 'test-secret', {
      expiresIn: '1h',
    });
  }

  static createAuthHeaders(token: string): { Authorization: string } {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static getTestPayloads() {
    return {
      createUser: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
        phoneNumber: '+1234567890',
      },
      login: {
        email: 'admin@school.com',
        password: 'admin123',
      },
      createStudent: {
        gradeLevelId: 'grade-10-id',
        classId: 'class-a-id',
      },
    };
  }

  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static validateResponseStructure(response: any): void {
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('body');
  }

  static validateErrorResponse(response: any, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  }
} 