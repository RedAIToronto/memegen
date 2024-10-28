export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  
  // Check password
  if (password === 'ARESDEVKING123!') {
    // Set a secure HTTP-only cookie
    res.setHeader('Set-Cookie', 'admin_auth=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600');
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
