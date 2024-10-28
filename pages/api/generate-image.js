import Replicate from "replicate";
import { prisma } from '@/lib/prisma';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, walletAddress } = req.body;

    console.log('📝 Generation Request:', { prompt, model, walletAddress });

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Format the prompt based on the model
    const formattedPrompt = `${model.toUpperCase()} ${prompt}`;

    console.log('🎨 Generate Image Request:', {
      originalPrompt: prompt,
      model,
      formattedPrompt,
      timestamp: new Date().toISOString(),
    });

    try {
      // Create prediction using deployments
      let prediction = await replicate.deployments.predictions.create(
        "redaitoronto",
        model.toLowerCase(), // fwog, mew, or any other model ID added in admin
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

      // Wait for prediction to complete
      prediction = await replicate.wait(prediction);
      console.log('✅ Generation Complete:', prediction);

      if (!prediction.output || !Array.isArray(prediction.output)) {
        throw new Error('Invalid output from model');
      }

      console.log('💾 Saving to database:', {
        prompt,
        imageUrl: prediction.output[0],
        model: model.toLowerCase(),
        modelName: model.toUpperCase(),
        walletAddress
      });

      // Store the generation in the database
      const generation = await prisma.generation.create({
        data: {
          prompt,
          imageUrl: prediction.output[0],
          model: model.toLowerCase(),
          modelName: model.toUpperCase(),
          walletAddress,
          createdAt: new Date()
        }
      });

      console.log('✅ Saved to database:', generation);

      return res.status(200).json({
        success: true,
        images: prediction.output,
        generation
      });

    } catch (error) {
      console.error('❌ Error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to generate image: ${error.message}`
    });
  }
}
