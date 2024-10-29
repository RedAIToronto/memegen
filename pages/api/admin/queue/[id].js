import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Check auth from cookie instead of header
  const adminToken = req.cookies.admin_token;
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      const updated = await prisma.modelQueue.update({
        where: { id },
        data: { status }
      });
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.modelQueue.delete({
        where: { id }
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}





























































































































































































































































