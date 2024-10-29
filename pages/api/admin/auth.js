export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password || password !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Set auth cookie
    const cookieValue = `admin_token=${process.env.ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Lax`;
    
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Set-Cookie', cookieValue + '; Secure');
    } else {
      res.setHeader('Set-Cookie', cookieValue);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}






