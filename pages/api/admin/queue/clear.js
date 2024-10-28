import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Delete all records from the queue
    await prisma.modelQueue.deleteMany({});
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to clear queue:', error);
    return res.status(500).json({ error: 'Failed to clear queue' });
  }
}
