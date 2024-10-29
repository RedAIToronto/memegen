import { prisma, connectToDatabase } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    if (req.method === 'GET') {
      const { limit = 10 } = req.query;
      
      const generations = await prisma.generation.findMany({
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        generations: generations.map(gen => ({
          ...gen,
          createdAt: gen.createdAt.toISOString()
        }))
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
} 
