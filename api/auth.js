import { checkRateLimit } from './_lib/rateLimit.js';
import { sqlQuery } from './_lib/db.js';
import { signToken, verifyToken } from './_lib/jwt.js';
import crypto from 'crypto';

function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 600000, 64, 'sha512').toString('hex');
  return `${generatedSalt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || '').split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

let authTablesChecked = false;
async function ensureAuthTables() {
  if (authTablesChecked) return;
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(64),
        password_hash TEXT NOT NULL,
        citizen_type VARCHAR(64) DEFAULT 'indigene',
        quarter VARCHAR(120),
        compound VARCHAR(160),
        id_card_number VARCHAR(64),
        role VARCHAR(64) DEFAULT 'citizen',
        agency_name VARCHAR(255),
        badge_number VARCHAR(64),
        is_officer_verified BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(64) DEFAULT 'citizen'`).catch(() => {});
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255)`).catch(() => {});
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_number VARCHAR(64)`).catch(() => {});
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_officer_verified BOOLEAN DEFAULT FALSE`).catch(() => {});
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE`).catch(() => {});
    await sqlQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`).catch(() => {});

    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS id_cards (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        card_type VARCHAR(64) DEFAULT 'indigene',
        dob VARCHAR(32),
        compound VARCHAR(160),
        quarter VARCHAR(120),
        phone VARCHAR(64),
        email VARCHAR(255),
        address TEXT,
        occupation VARCHAR(160),
        status VARCHAR(32) DEFAULT 'approved',
        issued_date VARCHAR(32),
        expiry_date VARCHAR(32),
        photo_url TEXT,
        verified_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const defaultHash = 'a1b2c3d4e5f60718:b920824b5f5b276c0ce73a4b033f16f60e0a9c2d550ce6fcb7ffe2243dfb14b1215f9de7a1aa464994c607b8c9f0c229f98b09f4052b4948ff1f20a9bc9fd8d9';
    const seedOfficers = [
      ['usr_cmd_001', 'Cmdr. Segun Ogunjobi', 'commander@ogereremo.org', '08030001122', defaultHash, 'officer', 'Oke-Ogere', 'Joint Task Force HQ', 'CMD-OGR-001', 'security_commander', 'Ogere Joint Security Task Force', 'CMD-OGR-001'],
      ['usr_sec_001', 'Insp. Kayode Adeleke', 'police@ogereremo.org', '08031112233', defaultHash, 'officer', 'Expressway Axis', 'Nigeria Police Force HQ', 'NPF-OG-4891', 'security_officer', 'Nigeria Police Force (NPF)', 'NPF-OG-4891'],
      ['usr_adm_001', 'Engr. Olufemi Balogun (Admin)', 'admin@ogereremo.org', '08033334455', defaultHash, 'indigene', 'Oke-Ogere', 'OCDA Central Command', 'OGR-ADM-101', 'ocda_admin', 'Ogere Community Development Association (OCDA)', 'OCDA-ADM-101'],
      ['usr_pal_001', 'Prince Olawale Babatunde', 'protocol@ogereremo.org', '08032223344', defaultHash, 'indigene', 'Oke-Ogere', 'Aafin Ologere', 'PAL-PRO-002', 'palace_protocol', 'Aafin Ologere Palace Secretariat', 'PAL-PRO-002'],
    ];
    for (const o of seedOfficers) {
      await sqlQuery(
        `INSERT INTO users (id, full_name, email, phone, password_hash, citizen_type, quarter, compound, id_card_number, role, agency_name, badge_number, is_officer_verified, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, TRUE)
         ON CONFLICT (id) DO UPDATE SET badge_number = EXCLUDED.badge_number, role = EXCLUDED.role, agency_name = EXCLUDED.agency_name, is_officer_verified = TRUE`,
        o
      ).catch(() => {});
    }
    authTablesChecked = true;
  } catch (e) {
    console.warn('[API Auth] Schema ensure notice:', e.message);
  }
}


export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://ogere-remo-portal.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp, 10, 900000)) { // 10 requests per 15 minutes
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
  }

  await ensureAuthTables();

  const action = req.query.action || (req.body && req.body.action) || 'login';

  // --- 1. USER REGISTRATION ---
  if (req.method === 'POST' && action === 'register') {
    const {
      fullName,
      email,
      phone,
      password,
      citizenType = 'indigene', // 'indigene', 'non-indigene', 'guest', 'officer'
      accountType, // 'citizen' or 'officer' / 'admin'
      role, // 'security_officer', 'palace_protocol', 'ocda_admin', 'super_admin'
      agencyName,
      badgeNumber,
      agencyAccessKey,
      // Indigene-specific location fields
      indigeneResidency = 'ogere', // 'ogere', 'diaspora', 'nigeria'
      diasporaCountry,
      diasporaCity,
      nigeriaState,
      nigeriaCity,
      quarter,
      compound,
      // Non-indigene resident fields
      address,
      occupation,
      // Guest fields
      guestInterest,
      cityCountry,
      organization,
    } = req.body || {};

    const isOfficerSignup = accountType === 'officer' || accountType === 'admin' || citizenType === 'officer';

    // Validate Officer Registration Access Key
    const VALID_OFFICER_KEYS = {
      security_officer: ['OGERE-SEC-2026', 'POLICE-OG-99', 'SO-SAFE-OG', 'VIGILANTE-OG'],
      palace_protocol: ['AAFIN-PROTO-2026', 'KANKANBIINA-2026', 'PALACE-OFFICER-01'],
      ocda_admin: ['OCDA-HQ-2026', 'OGERE-CIVIC-ADMIN', 'REMO-DEV-2026'],
    };

    if (isOfficerSignup) {
      if (!role || !agencyName || !badgeNumber) {
        return res.status(400).json({
          success: false,
          error: 'Official agency name, badge/service number, and assigned operational role are required.',
        });
      }

      // Check access key (allow demo bypass if matching prefix or key provided)
      const allowedKeys = VALID_OFFICER_KEYS[role] || ['OGERE-OFFICER-2026'];
      const passedKey = (agencyAccessKey || '').trim().toUpperCase();
      const isValidKey = allowedKeys.includes(passedKey) || passedKey === 'OGERE2026' || passedKey === 'PALACE2026' || passedKey === 'SECURITY2026';

      if (!isValidKey && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Invalid Agency Departmental Authorization Key. Please contact the Palace ICT Secretariat or OCDA Command.',
        });
      }
    }

    const cleanFullName = (fullName || '').trim();
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim().replace(/[^\d+]/g, '') : null;

    if (!cleanFullName || !password || (!cleanEmail && !cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Full name, password, and at least email or phone are required.',
      });
    }

    try {
      // Check if user already exists
      const existing = await sqlQuery(
        'SELECT id, email, phone FROM users WHERE (email IS NOT NULL AND email = $1) OR (phone IS NOT NULL AND phone = $2)',
        [cleanEmail || null, cleanPhone || null]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email or phone number already exists.',
        });
      }

      const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const passwordHash = hashPassword(password);

      // Generate distinct Digital ID Card Number based on category and residency
      const randNum = Math.floor(100000 + Math.random() * 900000);
      let cardPrefix = 'OGR-IND';
      let normalizedType = 'indigene';
      let locationSummary = '';
      let subCategoryLabel = '';

      if (citizenType === 'indigene') {
        normalizedType = 'indigene';
        if (indigeneResidency === 'diaspora') {
          cardPrefix = 'OGR-IND-INT';
          locationSummary = `Diaspora (${diasporaCity ? diasporaCity + ', ' : ''}${diasporaCountry || 'International'})`;
          subCategoryLabel = 'Indigene Ã‚Â· Diaspora';
        } else if (indigeneResidency === 'nigeria') {
          cardPrefix = 'OGR-IND-NG';
          locationSummary = `Nigeria (${nigeriaCity ? nigeriaCity + ', ' : ''}${nigeriaState || 'Interstate'})`;
          subCategoryLabel = 'Indigene Ã‚Â· In Nigeria';
        } else {
          cardPrefix = 'OGR-IND-OG';
          locationSummary = `Resident in Ogere Remo (${quarter || 'Oke-Ogere'})`;
          subCategoryLabel = 'Indigene Ã‚Â· Resident in Ogere';
        }
      } else if (citizenType === 'non-indigene' || citizenType === 'resident') {
        cardPrefix = 'OGR-RES';
        normalizedType = 'non-indigene';
        locationSummary = address ? `${address}, Ogere Remo` : `Resident in Ogere (${quarter || 'Oke-Ogere'})`;
        subCategoryLabel = 'Non-Indigene Resident';
      } else if (citizenType === 'guest' || citizenType === 'non-resident') {
        cardPrefix = 'OGR-GST';
        normalizedType = 'guest';
        locationSummary = cityCountry || 'External Supporter';
        subCategoryLabel = `Guest (${guestInterest || 'Friend of Ogere'})`;
      }

      const cardId = `${cardPrefix}-${randNum}`;

      const assignedRole = isOfficerSignup ? role : (normalizedType === 'guest' ? 'guest' : 'citizen');
      const finalAgency = isOfficerSignup ? agencyName : null;
      const finalBadge = isOfficerSignup ? badgeNumber : null;

      // 1. Insert into users table
      await sqlQuery(
        `INSERT INTO users (id, full_name, email, phone, password_hash, citizen_type, quarter, compound, id_card_number, role, agency_name, badge_number, is_officer_verified, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)`,
        [
          userId,
          fullName,
          email || null,
          phone || null,
          passwordHash,
          normalizedType,
          quarter || (normalizedType === 'guest' ? 'Guest / External' : 'Oke-Ogere'),
          compound || (isOfficerSignup ? (agencyName || '') : ''),
          cardId,
          assignedRole,
          finalAgency,
          finalBadge,
          isOfficerSignup,
        ]
      );

      // 2. Automatically generate and insert official Digital ID Card into id_cards table
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0];

      await sqlQuery(
        `INSERT INTO id_cards 
          (id, full_name, card_type, compound, quarter, phone, email, address, occupation, status, issued_date, expiry_date, verified_by)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved', $10, $11, 'HRH Ologere Palace ICT Registry')
         ON CONFLICT (id) DO NOTHING`,
        [
          cardId,
          fullName,
          normalizedType,
          compound || (normalizedType === 'guest' ? (guestInterest || 'Friend of Ogere') : ''),
          quarter || (normalizedType === 'guest' ? 'External / Guest' : 'Oke-Ogere'),
          phone || '',
          email || '',
          locationSummary,
          occupation || organization || (normalizedType === 'guest' ? 'Civic Guest & Partner' : 'Community Member'),
          today,
          expiry,
        ]
      ).catch(err => {
        console.warn('[API Auth] Warning inserting to id_cards table:', err.message);
      });

      const token = signToken({ id: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 });

      const idCardObj = {
        id: cardId,
        fullName,
        cardType: normalizedType,
        subCategoryLabel,
        locationSummary,
        indigeneResidency: citizenType === 'indigene' ? indigeneResidency : null,
        quarter: quarter || (normalizedType === 'guest' ? 'External' : 'Oke-Ogere'),
        compound: compound || '',
        guestInterest: normalizedType === 'guest' ? guestInterest : null,
        status: 'approved',
        issuedDate: today,
        expiryDate: expiry,
        verifiedBy: 'HRH Ologere Palace ICT Registry',
        qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${cardId}`,
      };

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Digital ID card generated.',
        token,
        user: {
          id: userId,
          fullName,
          email,
          phone,
          citizenType: normalizedType,
          subCategoryLabel,
          locationSummary,
          indigeneResidency: citizenType === 'indigene' ? indigeneResidency : null,
          diasporaCountry: diasporaCountry || null,
          diasporaCity: diasporaCity || null,
          nigeriaState: nigeriaState || null,
          nigeriaCity: nigeriaCity || null,
          guestInterest: guestInterest || null,
          quarter: quarter || (normalizedType === 'guest' ? 'External' : 'Oke-Ogere'),
          compound: compound || '',
          idCardNumber: cardId,
          role: assignedRole,
          agencyName: finalAgency,
          badgeNumber: finalBadge,
          isOfficerVerified: isOfficerSignup,
          isVerified: true,
          idCard: idCardObj,
        },
      });
    } catch (err) {
      console.error('[API Auth] Register error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- 2. USER LOGIN ---
  if (req.method === 'POST' && action === 'login') {
    const { identifier, password } = req.body || {};
    const rawIdent = (identifier || '').trim();
    if (!rawIdent || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, phone, ID number, or badge identifier and password are required.',
      });
    }

    const cleanIdent = rawIdent.toLowerCase();
    const cleanPhone = rawIdent.replace(/[^\d+]/g, '');

    try {
      const rows = await sqlQuery(
        'SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $1 OR LOWER(badge_number) = $1 OR LOWER(id_card_number) = $1 LIMIT 1',
        [cleanIdent]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please check your email/phone and password.',
        });
      }

      const user = rows[0];
      const isValid = verifyPassword(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please check your password.',
        });
      }

      // Update last login
      await sqlQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const token = signToken({ id: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 });

      let idCardData = null;
      if (user.id_card_number) {
        const cardRows = await sqlQuery('SELECT * FROM id_cards WHERE id = $1 LIMIT 1', [user.id_card_number]).catch(() => []);
        if (cardRows.length > 0) {
          const c = cardRows[0];
          idCardData = {
            id: c.id,
            fullName: c.full_name,
            cardType: c.card_type,
            quarter: c.quarter,
            compound: c.compound,
            status: c.status,
            issuedDate: c.issued_date,
            expiryDate: c.expiry_date,
            verifiedBy: c.verified_by,
            qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${c.id}`,
          };
        } else {
          idCardData = {
            id: user.id_card_number,
            fullName: user.full_name,
            cardType: user.citizen_type,
            quarter: user.quarter,
            compound: user.compound,
            status: 'approved',
            issuedDate: user.created_at ? user.created_at.toString().split('T')[0] : '2026-01-01',
            expiryDate: '2029-01-01',
            verifiedBy: 'HRH Ologere Palace ICT Registry',
            qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${user.id_card_number}`,
          };
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          citizenType: user.citizen_type,
          quarter: user.quarter,
          compound: user.compound,
          idCardNumber: user.id_card_number,
          role: user.role,
          agencyName: user.agency_name,
          badgeNumber: user.badge_number,
          isOfficerVerified: user.is_officer_verified,
          isVerified: user.is_verified,
          idCard: idCardData,
        },
      });
    } catch (err) {
      console.error('[API Auth] Login error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- 3. GET CURRENT PROFILE ---
  if (req.method === 'GET' && action === 'me') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required.' });
    }

    try {
      const payload = verifyToken(token);
      if (!payload || !payload.id || payload.exp < Date.now()) {
        return res.status(401).json({ success: false, error: 'Session expired or invalid token.' });
      }

      const rows = await sqlQuery('SELECT * FROM users WHERE id = $1', [payload.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      const user = rows[0];
      let idCardData = null;
      if (user.id_card_number) {
        const cardRows = await sqlQuery('SELECT * FROM id_cards WHERE id = $1 LIMIT 1', [user.id_card_number]).catch(() => []);
        if (cardRows.length > 0) {
          const c = cardRows[0];
          idCardData = {
            id: c.id,
            fullName: c.full_name,
            cardType: c.card_type,
            quarter: c.quarter,
            compound: c.compound,
            status: c.status,
            issuedDate: c.issued_date,
            expiryDate: c.expiry_date,
            verifiedBy: c.verified_by,
            qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${c.id}`,
          };
        } else {
          idCardData = {
            id: user.id_card_number,
            fullName: user.full_name,
            cardType: user.citizen_type,
            quarter: user.quarter,
            compound: user.compound,
            status: 'approved',
            issuedDate: user.created_at ? user.created_at.toString().split('T')[0] : '2026-01-01',
            expiryDate: '2029-01-01',
            verifiedBy: 'HRH Ologere Palace ICT Registry',
            qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${user.id_card_number}`,
          };
        }
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          citizenType: user.citizen_type,
          quarter: user.quarter,
          compound: user.compound,
          idCardNumber: user.id_card_number,
          role: user.role,
          agencyName: user.agency_name,
          badgeNumber: user.badge_number,
          isOfficerVerified: user.is_officer_verified,
          isVerified: user.is_verified,
          idCard: idCardData,
        },
      });
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
  }

  // --- 4. DELETE ACCOUNT (Google Play Store Account Deletion Compliance) ---
  if (req.method === 'POST' && action === 'delete_account') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const { userId } = req.body || {};

    let targetId = userId;
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload?.id) targetId = payload.id;
      } catch (_) {}
    }

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'User account ID or token required for deletion.' });
    }

    try {
      const existing = await sqlQuery('SELECT id, id_card_number FROM users WHERE id = $1 LIMIT 1', [targetId]);
      if (existing.length > 0 && existing[0].id_card_number) {
        await sqlQuery('DELETE FROM id_cards WHERE id = $1', [existing[0].id_card_number]).catch(() => {});
      }
      await sqlQuery('DELETE FROM users WHERE id = $1', [targetId]);
      return res.status(200).json({
        success: true,
        message: 'Account and associated personal data permanently deleted.',
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- 5. SUPERADMIN SIMPLE AUTH ---
  if (req.method === 'POST' && (action === 'admin_login' || action === 'superadmin')) {
    const { password } = req.body || {};
    const ADMIN_PW = process.env.ADMIN_PASSWORD || 'ogere2026';
    if (password === ADMIN_PW) {
      const adminToken = Buffer.from(JSON.stringify({ role: 'superadmin', exp: Date.now() + 86400000 })).toString('base64');
      return res.status(200).json({ success: true, token: adminToken });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }
  }

  return res.status(400).json({ success: false, error: 'Unknown action.' });
}


