import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const models = await prisma.availableModel.findMany({
        where: { available: true }
      });
      return res.status(200).json({ models });
    } catch (error) {
      console.error('Error fetching models:', error);
      return res.status(500).json({ error: 'Failed to fetch models' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
