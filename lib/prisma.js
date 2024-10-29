import { PrismaClient } from '@prisma/client'

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error']
  });
} else {
  // In development, create a single instance
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error']
    });
  }
  prisma = global.prisma;
}

// Add connection management
async function connectToDatabase() {
  try {
    await prisma.$connect();
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export { prisma, connectToDatabase };






























