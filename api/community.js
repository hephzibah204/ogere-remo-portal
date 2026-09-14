import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const isScholarships = pathname.includes('scholarships') || req.query.type === 'scholarships';
  const isForum = pathname.includes('forum') || req.query.type === 'forum';

  // 1. Scholarships
  if (isScholarships) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const appId = body.id || `SCH-APP-${Math.floor(100 + Math.random() * 900)}`;

      try {
        await sqlQuery(
          `INSERT INTO scholarship_applications
            (id, program_id, program_title, applicant_name, compound, institution, cgpa, email, phone, statement, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            appId,
            body.programId || '1',
            body.programTitle || 'Ogere Kingdom Academic Grant',
            body.applicantName || '',
            body.compound || '',
            body.institution || '',
            body.cgpa || '',
            body.email || '',
            body.phone || '',
            body.statement || '',
            body.status || 'under_review',
          ]
        );

        return res.status(201).json({
          success: true,
          message: 'Scholarship application submitted and registered in Neon database.',
          data: { id: appId, ...body },
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    try {
      const rows = await sqlQuery('SELECT * FROM scholarship_applications ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ success: true, total: rows.length, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. Forum
  if (isForum) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const postId = Date.now();

      try {
        await sqlQuery(
          `INSERT INTO forum_posts (id, author_name, category, topic, body) VALUES ($1, $2, $3, $4, $5)`,
          [postId, body.name || 'Citizen', body.cat || 'general', body.topic || '', body.body || '']
        );

        return res.status(201).json({
          success: true,
          message: 'Discussion topic posted to community forum.',
          data: { id: postId, ...body },
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    try {
      const rows = await sqlQuery('SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ success: true, total: rows.length, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Default community status
  return res.status(200).json({
    success: true,
    service: 'Ogere Remo Community API',
    timestamp: new Date().toISOString(),
  });
}
