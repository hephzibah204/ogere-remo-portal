import { checkRateLimit } from './_lib/rateLimit.js';
import { verifyUserAuth } from './_lib/db.js';

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://ogere-remo-portal.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Auth Check
  const auth = await verifyUserAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to use AI features.' });
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp, 20, 900000)) { // 20 requests per 15 minutes
    return res.status(429).json({ error: 'Too many AI requests. Please try again later.' });
  }

  const { provider, system, userContent, messages, model } = req.body;

  if (provider === 'anthropic') {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Anthropic API key not configured' });

    try {
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system,
          messages: messages || [{ role: 'user', content: userContent }],
        }),
      });

      if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Upstream Anthropic API Error' });
      const data = await apiRes.json();
      return res.status(200).json({ content: data.content?.[0]?.text });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (provider === 'openrouter') {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) return res.status(503).json({ error: 'OpenRouter API key not configured' });

    try {
      const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.SITE_URL || 'https://ogere-remo-portal.vercel.app',
          'X-Title': 'Ogere Remo Community Portal',
        },
        body: JSON.stringify({
          model: model || 'openai/gpt-4o-mini',
          max_tokens: 800,
          messages: messages || [
            { role: 'system', content: system },
            { role: 'user', content: userContent },
          ],
        }),
      });

      if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Upstream OpenRouter API Error' });
      const data = await apiRes.json();
      return res.status(200).json({ content: data.choices?.[0]?.message?.content });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown AI provider requested.' });
}
