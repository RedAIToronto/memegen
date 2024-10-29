import Replicate from "replicate";
import { prisma } from '@/lib/prisma';

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: true,
    responseLimit: false,
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, walletAddress, signature } = req.body;

    if (!prompt || !model || !walletAddress || !signature) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          prompt: !prompt ? 'Required' : undefined,
          model: !model ? 'Required' : undefined,
          walletAddress: !walletAddress ? 'Required' : undefined,
          signature: !signature ? 'Required' : undefined,
        }
      });
    }

    // Create a pending generation record - now without imageUrl
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

    // Start the generation process in the background
    generateImage(generation.id, prompt, model).catch(error => {
      console.error('Background generation error:', error);
      prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'failed',
          error: error.message
        }
      }).catch(console.error);
    });

    // Immediately return the generation ID
    return res.status(202).json({
      success: true,
      generationId: generation.id,
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

async function generateImage(generationId, prompt, model) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const formattedPrompt = `${model.toUpperCase()} ${prompt}`;
    
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

    const result = await replicate.wait(prediction);

    if (!result.output || !Array.isArray(result.output)) {
      throw new Error('Invalid output from model');
    }

    // Update the generation record with the result
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        imageUrl: result.output[0],
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'failed',
        error: error.message
      }
    });
    throw error; // Re-throw to be caught by the caller
  }
}
