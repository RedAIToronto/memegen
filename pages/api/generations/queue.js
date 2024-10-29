import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queue = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // Limit to last 50 items
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        model: true,
        modelName: true,
        walletAddress: true,
        createdAt: true,
        status: true,
        error: true,
        signature: true
      }
    });

    return res.status(200).json({
      success: true,
      queue
    });
  } catch (error) {
    console.error('Failed to fetch queue:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch queue'
    });
  }
}


