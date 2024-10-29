import { prisma } from '@/lib/prisma';



export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  try {

    await prisma.$connect();

    

    const queue = await prisma.modelQueue.findMany({

      orderBy: {

        createdAt: 'desc'

      },

      where: {

        status: {

          not: 'completed'

        }

      }

    });



    return res.status(200).json({ 

      success: true,

      queue 

    });

  } catch (error) {

    console.error('Queue error:', error);

    return res.status(500).json({ 

      success: false,

      error: error.message || 'Failed to fetch queue'

    });

  } finally {

    await prisma.$disconnect();

  }

} 


