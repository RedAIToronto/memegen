import { prisma } from '@/lib/prisma';



export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  try {

    await prisma.$connect();

    

    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const generations = await prisma.generation.findMany({

      orderBy: {

        createdAt: 'desc'

      },

      take: limit,

      select: {

        id: true,

        prompt: true,

        imageUrl: true,

        model: true,

        modelName: true,

        createdAt: true

      }

    });



    await prisma.$disconnect();



    return res.status(200).json({ 

      success: true,

      generations 

    });

  } catch (error) {

    console.error('Failed to fetch generations:', error);

    await prisma.$disconnect();

    return res.status(500).json({ 

      success: false,

      error: 'Failed to fetch generations',

      details: process.env.NODE_ENV === 'development' ? error.message : undefined

    });

  }

} 
