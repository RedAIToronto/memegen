import { prisma } from '@/lib/prisma'



export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({ error: 'Method not allowed' })

  }



  try {

    const queue = await prisma.modelQueue.findMany({

      where: {

        status: {

          not: 'completed'

        }

      },

      orderBy: {

        createdAt: 'desc'

      },

      select: {

        id: true,

        name: true,

        status: true,

        previewImage: true,

        estimatedTime: true,

        createdAt: true

      }

    })



    return res.status(200).json({

      success: true,

      queue

    })

  } catch (error) {

    console.error('Failed to fetch queue:', error)

    return res.status(500).json({

      success: false,

      error: 'Failed to fetch queue'

    })

  }

} 
