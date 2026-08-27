import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  try {
    const dbCheck = await sqlQuery('SELECT NOW() as db_time, current_database() as database_name');
    
    res.status(200).json({
      status: 'ok',
      service: 'Ogere Remo Kingdom Portal Serverless API',
      version: '6.0.0',
      database: {
        connected: true,
        engine: 'Neon Serverless PostgreSQL',
        databaseName: dbCheck[0]?.database_name,
        databaseTime: dbCheck[0]?.db_time,
      },
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/verify-id',
        '/api/id-cards',
        '/api/royal-audiences',
        '/api/marketplace',
        '/api/land-registry',
        '/api/donations',
        '/api/paystack-webhook',
        '/api/forum',
      ],
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'Ogere Remo Kingdom Portal Serverless API',
      database: { connected: false, error: err.message },
      timestamp: new Date().toISOString(),
    });
  }
}
