import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    // Add extra buffer for potentially broken images
    const bufferLimit = limit * 2;

    const generations = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: bufferLimit,
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        model: true,
        modelName: true,
        createdAt: true
      }
    });

    // Pre-validate URLs
    const validGenerations = generations.filter(gen => {
      try {
        new URL(gen.imageUrl);
        return true;
      } catch {
        return false;
      }
    });

    // Return only the requested number of valid generations
    return res.status(200).json({ 
      success: true,
      generations: validGenerations.slice(0, limit) 
    });
  } catch (error) {
    console.error('Failed to fetch generations:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch generations' 
    });
  }
}
