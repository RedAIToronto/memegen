import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const generations = await prisma.generation.findMany({
      select: {
        id: true,
        imageUrl: true,
        prompt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Debug: Found generations:', generations);

    return res.status(200).json({ 
      success: true,
      generations 
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
} 