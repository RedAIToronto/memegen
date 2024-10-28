export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Image ID required' });
  }

  try {
    // Get the original image URL from your database
    const generation = await prisma.generation.findUnique({
      where: { id }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Proxy the image
    const imageResponse = await fetch(generation.imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    return res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
}
