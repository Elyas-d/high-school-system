const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Initialize test database connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Store prisma instance globally for tests
  global.prisma = prisma;
});

// Global test teardown
afterAll(async () => {
  const prisma = global.prisma;
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Reset database between tests
beforeEach(async () => {
  const prisma = global.prisma;
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