import pg from 'pg';
const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required in production.');
      }
      console.warn('DATABASE_URL is not set. Database operations will fail unless configured in environment.');
    }

    pool = new Pool({
      connectionString: connectionString || undefined,
      ssl: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
      max: parseInt(process.env.PG_MAX_POOL || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function sqlQuery(queryText, params = []) {
  const p = getPool();
  const res = await p.query(queryText, params || []);
  return res.rows;
}
