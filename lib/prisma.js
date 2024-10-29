import { PrismaClient } from '@prisma/client'

let prisma

// Check if we're running in production
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['error'],
    errorFormat: 'minimal',
  })
} else {
  // In development, use global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.prisma
}

// Add connection management
async function connectToDatabase() {
  try {
    await prisma.$connect()
    // Test the connection
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export { prisma, connectToDatabase }






























