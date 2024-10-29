import { prisma } from '@/lib/prisma';

// Simple admin check - you might want to make this more secure
const isAdmin = (req) => {
  // For development, you can use a header or cookie
  return req.headers['x-admin-token'] === process.env.ADMIN_SECRET;
};

export default async function handler(req, res) {
  // Check admin authorization
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await prisma.modelQueue.delete({
        where: { id }
      });
      
      return res.status(200).json({ 
        success: true,
        message: 'Queue item deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete queue item',
        details: error.message 
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      
      const updatedModel = await prisma.modelQueue.update({
        where: { id },
        data: { status }
      });

      return res.status(200).json(updatedModel);
    } catch (error) {
      console.error('Update error:', error);
      return res.status(500).json({ 
        error: 'Failed to update status',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
