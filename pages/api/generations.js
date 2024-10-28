import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📚 Fetching generations...');
    
    const generations = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    console.log(`✅ Found ${generations.length} generations`);

    return res.status(200).json({ 
      success: true,
      generations 
    });
  } catch (error) {
    console.error('❌ Failed to fetch generations:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch generations' 
    });
  }
}
