import { prisma } from '@/lib/prisma';



export default async function handler(req, res) {

  if (req.method === 'GET') {

    try {

      // Get all available models

      const models = await prisma.availableModel.findMany({

        where: {

          available: true

        }

      });



      // If no models exist, create default ones

      if (models.length === 0) {

        await prisma.availableModel.createMany({

          data: [

            {

              id: 'fwog',

              name: 'FWOG',

              promptPrefix: 'FWOG',

              previewImage: 'https://pbs.twimg.com/profile_images/1847811775242063874/aPQtRzhg_400x400.jpg',

              description: 'Generate FWOG-style images',

              owner: 'redaitoronto',

              modelId: 'fwog'

            },

            {

              id: 'mew',

              name: 'MEW',

              promptPrefix: 'MEW',

              previewImage: 'https://pbs.twimg.com/profile_images/1772493729120575488/U5fkTROU_400x400.jpg',

              description: 'Generate MEW-style images',

              owner: 'redaitoronto',

              modelId: 'mew'

            }

          ]

        });



        const newModels = await prisma.availableModel.findMany({

          where: {

            available: true

          }

        });



        return res.status(200).json({ success: true, models: newModels });

      }



      return res.status(200).json({ success: true, models });

    } catch (error) {

      console.error('Failed to fetch models:', error);

      // Return a proper JSON response

      return res.status(500).json({ 

        success: false, 

        error: 'Failed to fetch models',

        details: process.env.NODE_ENV === 'development' ? error.message : undefined

      });

    }

  }



  return res.status(405).json({ error: 'Method not allowed' });

}






