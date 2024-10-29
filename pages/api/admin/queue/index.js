import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Check auth from cookie instead of header
  const adminToken = req.cookies.admin_token;
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const queue = await prisma.modelQueue.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ queue });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
