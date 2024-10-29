import { prisma } from '@/lib/prisma'



export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  const { name } = req.query;



  try {

    const exists = await prisma.modelQueue.findFirst({

      where: {

        name: name

      }

    });



    return res.status(200).json({ exists: !!exists });

  } catch (error) {

    console.error('Model check error:', error);

    return res.status(500).json({ error: 'Failed to check model name' });

  }

} 
