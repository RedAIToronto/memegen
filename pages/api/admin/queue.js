import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Verify admin token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || 
      authHeader.split(' ')[1] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const queue = await prisma.modelQueue.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json({ queue });
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      return res.status(500).json({ error: 'Failed to fetch queue' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
