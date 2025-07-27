import { PrismaClient } from '@prisma/client';

// Create a global Prisma client instance
const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 