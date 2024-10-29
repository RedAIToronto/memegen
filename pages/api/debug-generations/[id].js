import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || 
      authHeader.split(' ')[1] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await prisma.generation.delete({
        where: { id: parseInt(id) }
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting generation:', error);
      return res.status(500).json({ error: 'Failed to delete generation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 