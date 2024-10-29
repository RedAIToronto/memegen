export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the cookie directly from headers
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {}) || {};

    const adminToken = cookies.admin_token;

    return res.status(200).json({
      authenticated: adminToken === process.env.ADMIN_SECRET
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(200).json({ authenticated: false });
  }
}






