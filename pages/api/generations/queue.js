import { prisma, connectToDatabase } from '@/lib/prisma'

export default async function handler(req, res) {
  try {
    const isConnected = await connectToDatabase()
    if (!isConnected) {
      throw new Error('Failed to connect to database')
    }

    const queue = await prisma.modelQueue.findMany({
      where: {
        status: {
          not: 'completed'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      success: true,
      queue: queue.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        startedAt: item.startedAt?.toISOString()
      }))
    })
  } catch (error) {
    console.error('Queue API error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch queue',
      message: error.message 
    })
  } finally {
    await prisma.$disconnect()
  }
}


