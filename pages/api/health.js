import { prisma, connectDB } from '@/lib/prisma'

export default async function handler(req, res) {
  try {
    await connectDB()
    
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  } finally {
    await prisma.$disconnect()
  }
} 