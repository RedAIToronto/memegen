import { prisma, connectToDatabase } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Get query parameters
    const { limit = 10, status, timeframe = '24h' } = req.query;

    // Calculate timeframe
    const timeframeDate = new Date();
    switch (timeframe) {
      case '1h':
        timeframeDate.setHours(timeframeDate.getHours() - 1);
        break;
      case '6h':
        timeframeDate.setHours(timeframeDate.getHours() - 6);
        break;
      case '24h':
        timeframeDate.setHours(timeframeDate.getHours() - 24);
        break;
      case '7d':
        timeframeDate.setDate(timeframeDate.getDate() - 7);
        break;
      default:
        timeframeDate.setHours(timeframeDate.getHours() - 24);
    }

    // Build where clause
    const where = {
      createdAt: {
        gte: timeframeDate
      },
      ...(status && { status })
    };

    // Get generations with detailed information
    const generations = await prisma.generation.findMany({
      take: parseInt(limit),
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        imageUrl: true,
        error: true,
        createdAt: true,
        completedAt: true,
        model: true,
        prompt: true,
        predictionId: true,
        walletAddress: true,
        signature: true
      }
    });

    // Get some statistics
    const stats = await prisma.generation.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Calculate success rate and average completion time
    const completedGens = generations.filter(g => g.status === 'completed' && g.completedAt);
    const avgCompletionTime = completedGens.length > 0 
      ? completedGens.reduce((acc, gen) => {
          return acc + (new Date(gen.completedAt) - new Date(gen.createdAt));
        }, 0) / completedGens.length / 1000 // Convert to seconds
      : null;

    return res.status(200).json({ 
      generations,
      stats: {
        total: generations.length,
        byStatus: stats,
        successRate: completedGens.length / generations.length,
        avgCompletionTime: avgCompletionTime ? `${avgCompletionTime.toFixed(1)}s` : 'N/A'
      },
      timeframe,
      queriedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug check error:', error);
    return res.status(500).json({ 
      error: 'Failed to get generations',
      details: error.message
    });
  }
}


