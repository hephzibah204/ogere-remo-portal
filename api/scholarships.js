import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const appId = body.id || `SCH-APP-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await sqlQuery(
        `INSERT INTO scholarship_applications
          (id, program_id, program_title, applicant_name, compound, institution, cgpa, email, phone, statement, status)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
          applicant_name = EXCLUDED.applicant_name,
          institution = EXCLUDED.institution,
          statement = EXCLUDED.statement`,
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
      console.error('Scholarship insertion error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const rows = await sqlQuery('SELECT * FROM scholarship_applications ORDER BY created_at DESC LIMIT 50');
    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
