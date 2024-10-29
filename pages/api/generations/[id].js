import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const generation = await prisma.generation.findUnique({
      where: { id }
    });

    if (!generation) {
      return res.status(404).json({ 
        success: false,
        error: 'Generation not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      generation 
    });
  } catch (error) {
    console.error('Failed to fetch generation:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch generation' 
    });
  }
}
