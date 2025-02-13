import { prisma } from '@/lib/prisma';



export default async function handler(req, res) {

  try {

    const { id } = req.query;



    if (!id) {

      return res.status(400).end();

    }



    const generation = await prisma.generation.findUnique({

      where: { id },

      select: {

        imageUrl: true,

      }

    });



    if (!generation?.imageUrl) {

      return res.status(404).end();

    }



    // Validate URL before redirecting

    try {

      new URL(generation.imageUrl);

    } catch {

      return res.status(404).end();

    }



    res.redirect(generation.imageUrl);

  } catch (error) {

    console.error('Proxy error:', error);

    res.status(500).end();

  }

}






























































































































