import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const prisma = (global as any).prisma as PrismaClient;

export interface TestUser {
  id: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface TestData {
  admin: TestUser;
  staff: TestUser;
  teacher: TestUser;
  student: TestUser;
  parent: TestUser;
}

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (userId: string, email: string, role: UserRole): string => {
  const jwtSecret = process.env['JWT_SECRET'] || 'test-secret-key';
  return jwt.sign(
    { userId, email, role },
    jwtSecret as jwt.Secret,
    { expiresIn: '15m' }
  );
};

/**
 * Create a test user with specified role
 */
export const createTestUser = async (
  role: UserRole,
  email?: string,
  password?: string
): Promise<TestUser> => {
  const hashedPassword = await bcrypt.hash(password || 'testpassword', 12);
  
  const user = await prisma.user.create({
    data: {
      firstName: `Test${role}`,
      lastName: 'User',
      email: email || `test.${role.toLowerCase()}@example.com`,
      password: hashedPassword,
      role,
    },
  });

  const token = generateTestToken(user.id, user.email, user.role);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
};

/**
 * Create all test users for different roles
 */
export const createTestUsers = async (): Promise<TestData> => {
  const [admin, staff, teacher, student, parent] = await Promise.all([
    createTestUser(UserRole.ADMIN, 'admin@test.com'),
    createTestUser(UserRole.STAFF, 'staff@test.com'),
    createTestUser(UserRole.TEACHER, 'teacher@test.com'),
    createTestUser(UserRole.STUDENT, 'student@test.com'),
    createTestUser(UserRole.PARENT, 'parent@test.com'),
  ]);

  return { admin, staff, teacher, student, parent };
};

/**
 * Create test grade level
 */
export const createTestGradeLevel = async () => {
  return await prisma.gradeLevel.create({
    data: {
      name: 'Grade 10',
      description: 'Tenth Grade',
    },
  });
};

/**
 * Create test subject
 */
export const createTestSubject = async (gradeLevelId: string) => {
  return await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Advanced Mathematics',
      gradeLevelId,
    },
  });
};

/**
 * Create test class
 */
export const createTestClass = async (subjectId: string, teacherId: string) => {
  return await prisma.class.create({
    data: {
      subjectId,
      teacherId,
      schedule: 'Monday 9:00 AM - 10:30 AM',
      roomNumber: 'Room 101',
    },
  });
};

/**
 * Create test student with user
 */
export const createTestStudent = async (userId: string, gradeLevelId: string, classId?: string) => {
  return await prisma.student.create({
    data: {
      userId,
      gradeLevelId,
      classId: classId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      gradeLevel: {
        select: {
          id: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Create test teacher with user
 */
export const createTestTeacher = async (userId: string) => {
  return await prisma.teacher.create({
    data: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Create test parent with user
 */
export const createTestParent = async (userId: string) => {
  return await prisma.parent.create({
    data: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Create test staff with user
 */
export const createTestStaff = async (userId: string) => {
  return await prisma.staff.create({
    data: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Create complete test scenario with all entities
 */
export const createCompleteTestScenario = async () => {
  // Create test users
  const testUsers = await createTestUsers();
  
  // Create grade level
  const gradeLevel = await createTestGradeLevel();
  
  // Create subject
  const subject = await createTestSubject(gradeLevel.id);
  
  // Create teacher
  const teacher = await createTestTeacher(testUsers.teacher.id);
  
  // Create class
  const classData = await createTestClass(subject.id, teacher.id);
  
  // Create student
  const student = await createTestStudent(testUsers.student.id, gradeLevel.id, classData.id);
  
  // Create parent
  const parent = await createTestParent(testUsers.parent.id);
  
  // Create staff
  const staff = await createTestStaff(testUsers.staff.id);
  
  return {
    users: testUsers,
    gradeLevel,
    subject,
    teacher,
    class: classData,
    student,
    parent,
    staff,
  };
};

/**
 * Helper to make authenticated requests
 */
export const makeAuthenticatedRequest = (
  request: any,
  method: string,
  url: string,
  token: string,
  data?: any
) => {
  const req = request[method.toLowerCase()](url);
  
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }
  
  if (data) {
    req.send(data);
  }
  
  return req;
};

/**
 * Helper to test protected routes
 */
export const testProtectedRoute = async (
  request: any,
  method: string,
  url: string,
  testUsers: TestData,
  expectedStatus: number,
  allowedRoles: UserRole[],
  data?: any
) => {
  // Test without token
  const noTokenResponse = await makeAuthenticatedRequest(request, method, url, '', data);
  expect(noTokenResponse.status).toBe(401);

  // Test with each role
  const roles = [testUsers.admin, testUsers.staff, testUsers.teacher, testUsers.student, testUsers.parent];
  
  for (const role of roles) {
    const response = await makeAuthenticatedRequest(request, method, url, role.token, data);
    
    if (allowedRoles.includes(role.role)) {
      expect(response.status).not.toBe(403);
    } else {
      expect(response.status).toBe(403);
    }
  }
}; 