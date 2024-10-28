export default function handler(req, res) {
  // Check for admin auth cookie
  const isAuthenticated = req.cookies.admin_auth === 'true';

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({ success: true });
}
