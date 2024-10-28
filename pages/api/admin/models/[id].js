import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Check if user is authenticated as admin
  // Add your admin authentication check here

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      await prisma.availableModel.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Model deleted successfully' });
    } catch (error) {
      console.error('Delete model error:', error);
      return res.status(500).json({ error: 'Failed to delete model' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
