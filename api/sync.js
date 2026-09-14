import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const since = req.query.since ? new Date(req.query.since) : new Date(0);
  const sinceIso = isNaN(since.getTime()) ? new Date(0).toISOString() : since.toISOString();

  try {
    // 1. Fetch businesses updated or created since timestamp
    const businesses = await sqlQuery(
      `SELECT * FROM businesses 
       WHERE created_at >= $1 
       ORDER BY created_at DESC LIMIT 100`,
      [sinceIso]
    ).catch(() => []);

    // 2. Fetch marketplace listings updated since timestamp
    const marketplace = await sqlQuery(
      `SELECT * FROM marketplace_listings 
       WHERE created_at >= $1 
       ORDER BY created_at DESC LIMIT 100`,
      [sinceIso]
    ).catch(() => []);

    // 3. Fetch news articles if table exists
    const news = await sqlQuery(
      `SELECT * FROM news_articles 
       WHERE updated_at >= $1 OR created_at >= $1 
       ORDER BY publish_date DESC LIMIT 50`,
      [sinceIso]
    ).catch(() => []);

    // 4. Return server sync response with current server timestamp
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      delta: {
        businesses,
        marketplace,
        news,
      },
      hasUpdates: businesses.length > 0 || marketplace.length > 0 || news.length > 0,
    });
  } catch (err) {
    console.error('[API Sync] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
