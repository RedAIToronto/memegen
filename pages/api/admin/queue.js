import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const queuedModels = await prisma.modelQueue.findMany({
          orderBy: { createdAt: 'desc' },
          where: {
            status: {
              not: 'completed'
            }
          }
        });
        return res.status(200).json({ queue: queuedModels });

      case 'POST':
        const modelData = req.body;
        const newQueueItem = await prisma.modelQueue.create({
          data: {
            ...modelData,
            status: 'queued',
            createdAt: new Date()
          }
        });
        return res.status(200).json({ 
          message: 'Added to queue',
          model: newQueueItem 
        });

      case 'DELETE':
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }
        await prisma.modelQueue.delete({
          where: { id }
        });
        return res.status(200).json({ 
          message: 'Removed from queue',
          id 
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue error:', error);
    return res.status(500).json({ 
      error: 'Failed to process queue request',
      details: error.message 
    });
  }
}
