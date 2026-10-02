export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body;
  const ADMIN_PW = process.env.ADMIN_PASSWORD || 'ogere2026';

  if (password === ADMIN_PW) {
    const adminToken = Buffer.from(JSON.stringify({ role: 'superadmin', exp: Date.now() + 86400000 })).toString('base64');
    return res.status(200).json({ success: true, token: adminToken });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
  }
}
