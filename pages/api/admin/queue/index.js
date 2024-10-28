import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const queue = await prisma.modelQueue.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          status: {
            not: 'completed'
          }
        }
      });
      return res.status(200).json({ queue });
    } catch (error) {
      console.error('Fetch queue error:', error);
      return res.status(500).json({ error: 'Failed to fetch queue' });
    }
  }

  if (req.method === 'POST') {
    try {
      const modelData = req.body;
      const queueItem = await prisma.modelQueue.create({
        data: modelData
      });
      return res.status(201).json(queueItem);
    } catch (error) {
      console.error('Add to queue error:', error);
      return res.status(500).json({ error: 'Failed to add to queue' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
