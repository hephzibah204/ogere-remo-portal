import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function deployDatabase() {
  await loadEnvFile();
  const dbUrl = process.env.DATABASE_URL || process.argv[2];

  console.log('🏛️  Ogere Remo Kingdom Portal — Database CLI Deployer');
  console.log('====================================================\n');

  if (!dbUrl) {
    console.log('ℹ️  No DATABASE_URL provided.');
    console.log('Usage: node scripts/deploy-db.js "postgresql://user:pass@host:5432/dbname"');
    console.log('\nAlternatively, set in your environment:\n$env:DATABASE_URL="postgresql://..."\nnode scripts/deploy-db.js\n');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: schema.sql file not found.');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  console.log(`📄 Read ${sqlContent.length} bytes from schema.sql`);
  console.log(`🔗 Connecting to PostgreSQL target database...`);

  try {
    // Dynamic import pg
    const pg = await import('pg');
    const { Client } = pg.default || pg;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('✅ Connected successfully to PostgreSQL database.');
    console.log('🚀 Applying tables, indexes, and initial seeds from schema.sql...');

    await client.query(sqlContent);
    console.log('🎉 Schema applied successfully! All 11 tables & seed records are live.');

    // Count tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📊 Public tables found (${res.rows.length}):`, res.rows.map(r => r.table_name).join(', '));

    await client.end();
    console.log('\n✨ Database deployment complete!');
  } catch (err) {
    console.error('❌ Failed to deploy schema to database:', err.message);
    process.exit(1);
  }
}

deployDatabase();
