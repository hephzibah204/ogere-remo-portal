import pg from 'pg';
const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      'postgresql://neondb_owner:npg_Lo5WFHY9tRVA@ep-calm-star-za63l01o.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require';

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

export async function sqlQuery(queryText, params = []) {
  const p = getPool();
  const res = await p.query(queryText, params || []);
  return res.rows;
}
