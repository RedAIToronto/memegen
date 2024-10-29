import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        status: true,
        error: true,
        model: true,
        modelName: true,
        createdAt: true
      }
    });

    if (!generation) {
      return res.status(404).json({ 
        success: false,
        error: 'Generation not found' 
      });
    }

    if (generation.status === 'pending' && !generation.imageUrl) {
      return res.status(200).json({
        success: true,
        generation: {
          ...generation,
          status: 'pending'
        }
      });
    }

    return res.status(200).json({
      success: true,
      generation
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to check generation status' 
    });
  }
} 