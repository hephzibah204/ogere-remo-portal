import { neon } from '@neondatabase/serverless';

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_Lo5WFHY9tRVA@ep-calm-star-za63l01o-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require';

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    DEFAULT_DB_URL;

  return neon(connectionString);
}

export async function sqlQuery(queryText, params = []) {
  try {
    const sql = getDb();
    return await sql(queryText, params);
  } catch (err) {
    console.error('[Neon Postgres Error]:', err.message);
    throw err;
  }
}
