import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env['NODE_ENV'] = 'test';
  
  // Initialize test database connection
      const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env['DATABASE_URL'] || '',
        },
      },
    });

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Test database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
  console.log('🧹 Test environment cleanup completed');
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
if (process.env['NODE_ENV'] === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Reset database between tests
beforeEach(async () => {
  const prisma = (global as any).prisma;
  if (prisma) {
    // Clean up all tables in reverse order of dependencies
    await prisma.payment.deleteMany();
    await prisma.chatSupport.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.material.deleteMany();
    await prisma.parentStudent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.gradeLevel.deleteMany();
    await prisma.user.deleteMany();
  }
}); 