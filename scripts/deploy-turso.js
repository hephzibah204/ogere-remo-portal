import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

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

async function deployTurso() {
  await loadEnvFile();

  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || process.argv[2];
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || process.argv[3];

  console.log('🏛️  Ogere Remo Kingdom Portal — Turso (libSQL) Schema Deployer');
  console.log('===============================================================\n');

  if (!tursoUrl) {
    console.log('ℹ️  No TURSO_DATABASE_URL provided.');
    console.log('Usage: node scripts/deploy-turso.js "libsql://[your-db].turso.io" "[auth-token]"');
    console.log('\nAlternatively, set in your .env or environment:');
    console.log('TURSO_DATABASE_URL=libsql://[your-db].turso.io');
    console.log('TURSO_AUTH_TOKEN=[your-token]\n');
    process.exit(1);
  }

  console.log(`🔗 Target Turso URL: ${tursoUrl}`);
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS id_cards (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      card_type TEXT NOT NULL DEFAULT 'indigene',
      dob TEXT,
      compound TEXT,
      quarter TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      occupation TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      issued_date TEXT,
      expiry_date TEXT,
      photo_url TEXT,
      verified_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE INDEX IF NOT EXISTS idx_id_cards_status ON id_cards(status);`,
    `CREATE INDEX IF NOT EXISTS idx_id_cards_quarter ON id_cards(quarter);`,

    `CREATE TABLE IF NOT EXISTS royal_audiences (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      purpose TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT,
      group_size TEXT DEFAULT '1',
      id_card TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      palace_chamber TEXT,
      confirmed_date TEXT,
      confirmed_time TEXT,
      postponed_reason TEXT,
      decline_reason TEXT,
      palace_notes TEXT,
      official_name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE INDEX IF NOT EXISTS idx_royal_audiences_status ON royal_audiences(status);`,

    `CREATE TABLE IF NOT EXISTS land_registry (
      id TEXT PRIMARY KEY,
      area_quarter TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      size_description TEXT NOT NULL,
      land_use TEXT NOT NULL DEFAULT 'Residential',
      status TEXT NOT NULL DEFAULT 'Verified',
      registration_date TEXT DEFAULT (datetime('now')),
      coordinates TEXT,
      disputes_count INTEGER DEFAULT 0,
      documents_ref TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS marketplace_listings (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price TEXT,
      seller_name TEXT NOT NULL,
      quarter TEXT,
      phone TEXT,
      whatsapp TEXT,
      image_url TEXT,
      icon TEXT,
      badge TEXT,
      is_verified INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS project_donations (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      project_title TEXT,
      donor_name TEXT NOT NULL,
      donor_email TEXT,
      donor_phone TEXT,
      amount_naira REAL NOT NULL,
      currency TEXT DEFAULT 'NGN',
      paystack_reference TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      anonymous INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS incident_reports (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'Medium',
      threat_level TEXT NOT NULL DEFAULT 'CODE_YELLOW',
      is_silent_panic INTEGER DEFAULT 0,
      is_live_tracking INTEGER DEFAULT 0,
      assigned_agency TEXT,
      responding_unit TEXT,
      agency_notes TEXT,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      ip_address TEXT,
      google_maps_url TEXT,
      description TEXT NOT NULL,
      reporter_name TEXT,
      reporter_phone TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      acknowledged_at TEXT,
      dispatched_at TEXT,
      arrived_at TEXT,
      resolved_at TEXT,
      voice_note_url TEXT,
      evidence_files TEXT,
      radio_sitreps TEXT,
      camera_feed_active INTEGER DEFAULT 0,
      audio_feed_active INTEGER DEFAULT 0,
      media_url TEXT,
      media_type TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      citizen_type TEXT DEFAULT 'indigene',
      quarter TEXT,
      compound TEXT,
      id_card_number TEXT,
      role TEXT DEFAULT 'citizen',
      agency_name TEXT,
      badge_number TEXT,
      is_officer_verified INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS scholarship_applications (
      id TEXT PRIMARY KEY,
      program_id TEXT,
      program_title TEXT,
      applicant_name TEXT NOT NULL,
      compound TEXT,
      institution TEXT,
      cgpa TEXT,
      email TEXT,
      phone TEXT,
      statement TEXT,
      status TEXT DEFAULT 'under_review',
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS community_messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      recipient_name TEXT,
      message_text TEXT NOT NULL,
      metadata TEXT,
      status TEXT DEFAULT 'delivered',
      created_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS customary_disputes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      complainant_name TEXT NOT NULL,
      complainant_phone TEXT NOT NULL,
      complainant_compound TEXT,
      complainant_quarter TEXT,
      respondent_name TEXT NOT NULL,
      respondent_phone TEXT,
      respondent_compound TEXT,
      respondent_quarter TEXT,
      location TEXT,
      assigned_arbitrator_id TEXT,
      assigned_arbitrator_name TEXT,
      status TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
      hearing_date TEXT,
      hearing_time TEXT,
      hearing_venue TEXT DEFAULT 'Inner Royal Council Chamber, Aafin Ologere',
      virtual_link TEXT,
      description TEXT NOT NULL,
      arbitrator_notes TEXT,
      decree_summary TEXT,
      decree_seal_number TEXT,
      filed_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS diaspora_escrow_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      target_budget_ngn REAL NOT NULL DEFAULT 0,
      target_budget_usd REAL DEFAULT 0,
      raised_ngn REAL NOT NULL DEFAULT 0,
      escrow_locked_ngn REAL NOT NULL DEFAULT 0,
      released_ngn REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'FUNDING',
      lead_contractor TEXT,
      lead_supervisor TEXT,
      palace_signatory TEXT,
      donors_count INTEGER DEFAULT 0,
      completion_percentage INTEGER DEFAULT 0,
      milestones TEXT DEFAULT '[]',
      cover_image TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,

    `CREATE TABLE IF NOT EXISTS civic_infrastructure_issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      quarter TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      severity TEXT NOT NULL DEFAULT 'HIGH',
      status TEXT NOT NULL DEFAULT 'REPORTED',
      upvotes INTEGER DEFAULT 0,
      reporter_name TEXT,
      description TEXT NOT NULL,
      assigned_contractor TEXT,
      contractor_eta TEXT,
      photo_url TEXT,
      reported_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`
  ];

  try {
    console.log(`🚀 Executing ${schemaStatements.length} SQLite/libSQL table & index statements on Turso...`);
    for (const stmt of schemaStatements) {
      await client.execute(stmt);
    }
    console.log('🎉 Turso database schema successfully initialized!');

    // Seed default administrative users if not present
    await client.execute({
      sql: `INSERT OR IGNORE INTO users 
            (id, full_name, email, phone, password_hash, citizen_type, quarter, compound, id_card_number, role, agency_name, badge_number, is_officer_verified, is_verified)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_admin_001',
        'Engr. Olufemi Balogun (Admin)',
        'admin@ogereremo.org',
        '08033334455',
        'a1b2c3d4e5f60718:b920824b5f5b276c0ce73a4b033f16f60e0a9c2d550ce6fcb7ffe2243dfb14b1215f9de7a1aa464994c607b8c9f0c229f98b09f4052b4948ff1f20a9bc9fd8d9',
        'indigene',
        'Oke-Ogere',
        'OCDA Central Command',
        'OGR-ADM-101',
        'ocda_admin',
        'Ogere Community Development Association (OCDA)',
        'OCDA-ADM-101',
        1,
        1
      ]
    });
    console.log('✅ Default administrator credentials seeded.');

    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
    console.log('\n📊 Turso Tables Found:');
    tables.rows.forEach(r => console.log(`  - ${r.name}`));
    console.log('\n✨ Turso database migration ready for production use!');
  } catch (err) {
    console.error('❌ Failed to deploy to Turso:', err.message);
    process.exit(1);
  }
}

deployTurso();
