import { prisma, connectToDatabase } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        imageUrl: true,
        error: true,
        createdAt: true,
        completedAt: true
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    return res.status(200).json({ generation });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: 'Failed to check generation status' });
  }
} 


