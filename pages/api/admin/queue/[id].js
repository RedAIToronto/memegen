import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    await prisma.modelQueue.delete({
      where: { id }
    });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      
      const updatedModel = await prisma.modelQueue.update({
        where: { id },
        data: {
          status,
          ...(status === 'training' ? { 
            startedAt: new Date(),
            estimatedTime: 'Training in progress (~1 hour remaining)'
          } : {}),
          ...(status === 'completed' ? {
            estimatedTime: 'Training completed'
          } : {})
        }
      });

      return res.status(200).json(updatedModel);
    } catch (error) {
      console.error('Update status error:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
