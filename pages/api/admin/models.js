import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  // Check if user is authenticated as admin
  // Add your admin authentication check here

  if (req.method === 'POST') {
    try {
      const modelData = req.body;

      // Validate required fields
      if (!modelData.id || !modelData.name || !modelData.promptPrefix) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if model ID already exists
      const existingModel = await prisma.availableModel.findUnique({
        where: { id: modelData.id },
      });

      if (existingModel) {
        return res.status(400).json({ error: 'Model ID already exists' });
      }

      // Create new model
      const model = await prisma.availableModel.create({
        data: modelData,
      });

      return res.status(201).json(model);
    } catch (error) {
      console.error('Create model error:', error);
      return res.status(500).json({ error: 'Failed to create model' });
    }
  }

  if (req.method === 'GET') {
    try {
      const models = await prisma.availableModel.findMany();
      return res.status(200).json({ models });
    } catch (error) {
      console.error('Fetch models error:', error);
      return res.status(500).json({ error: 'Failed to fetch models' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
