import Replicate from "replicate";
import { prisma, connectToDatabase } from '@/lib/prisma';

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: true,
    responseLimit: false,
  }
};

export default async function handler(req, res) {
  const isConnected = await connectToDatabase();
  if (!isConnected) {
    console.error('Database connection failed');
    return res.status(500).json({ error: 'Database connection failed' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, walletAddress, signature } = req.body;
    console.log('Starting generation with:', { prompt, model, walletAddress });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Create initial database record
    const generation = await prisma.generation.create({
      data: {
        prompt,
        status: 'pending',
        model: model.toLowerCase(),
        modelName: model.toUpperCase(),
        walletAddress,
        signature,
        createdAt: new Date()
      }
    });

    // Start the prediction
    const formattedPrompt = `${model.toUpperCase()} ${prompt}`;
    console.log(`[${generation.id}] Creating prediction with prompt: ${formattedPrompt}`);
    
    const prediction = await replicate.deployments.predictions.create(
      "redaitoronto",
      model.toLowerCase(),
      {
        input: {
          prompt: formattedPrompt,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 28,
          model: "dev",
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90
        }
      }
    );

    // Store the prediction ID immediately
    await prisma.generation.update({
      where: { id: generation.id },
      data: {
        status: 'processing',
        predictionId: prediction.id
      }
    });

    // Return immediately with both IDs
    return res.status(202).json({
      success: true,
      generationId: generation.id,
      predictionId: prediction.id,
      message: 'Generation started'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to start generation',
      details: error.message
    });
  }
}
