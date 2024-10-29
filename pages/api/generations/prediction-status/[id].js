import Replicate from "replicate";
import { prisma, connectToDatabase } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        imageUrl: true,
        error: true,
        predictionId: true
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // If we already have the result, return it
    if (generation.status === 'completed' && generation.imageUrl) {
      return res.status(200).json({ generation });
    }

    // If we have a prediction ID, check its status
    if (generation.predictionId) {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const prediction = await replicate.predictions.get(generation.predictionId);
      console.log(`Prediction status for ${id}:`, prediction.status);

      if (prediction.status === 'succeeded' && prediction.output?.[0]) {
        // Update the generation with the result
        const updatedGeneration = await prisma.generation.update({
          where: { id },
          data: {
            status: 'completed',
            imageUrl: prediction.output[0],
            completedAt: new Date()
          }
        });
        return res.status(200).json({ generation: updatedGeneration });
      }

      if (prediction.status === 'failed') {
        const updatedGeneration = await prisma.generation.update({
          where: { id },
          data: {
            status: 'failed',
            error: prediction.error || 'Prediction failed',
            completedAt: new Date()
          }
        });
        return res.status(200).json({ generation: updatedGeneration });
      }

      // Still processing
      return res.status(200).json({ 
        generation: {
          ...generation,
          status: 'processing'
        }
      });
    }

    return res.status(200).json({ generation });

  } catch (error) {
    console.error('Prediction status check error:', error);
    return res.status(500).json({ error: 'Failed to check prediction status' });
  }
} 