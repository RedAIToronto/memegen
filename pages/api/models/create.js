import { prisma } from '@/lib/prisma'



export default async function handler(req, res) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  const { name, previewImage, trainingData } = req.body;



  try {

    // Create model in queue

    const model = await prisma.modelQueue.create({

      data: {

        name,

        previewImage,

        fileUrl: trainingData,

        status: 'preparing',

        estimatedTime: 'Preparing for training...',

      }

    });



    console.log('Created model:', model);



    return res.status(200).json({ 

      success: true, 

      model 

    });

  } catch (error) {

    console.error('Model creation error:', error);

    return res.status(500).json({ error: 'Failed to create model' });

  }

} 
