import { sqlQuery } from './lib/db.js';
import crypto from 'crypto';

function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return `${generatedSalt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || '').split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    if (!fullName || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        error: 'Full name, password, and at least email or phone are required.',
      });
    }

    try {
      // Check if user already exists
      const existing = await sqlQuery(
        'SELECT id, email, phone FROM users WHERE (email IS NOT NULL AND email = $1) OR (phone IS NOT NULL AND phone = $2)',
        [email || null, phone || null]
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
          subCategoryLabel = 'Indigene · Diaspora';
        } else if (indigeneResidency === 'nigeria') {
          cardPrefix = 'OGR-IND-NG';
          locationSummary = `Nigeria (${nigeriaCity ? nigeriaCity + ', ' : ''}${nigeriaState || 'Interstate'})`;
          subCategoryLabel = 'Indigene · In Nigeria';
        } else {
          cardPrefix = 'OGR-IND-OG';
          locationSummary = `Resident in Ogere Remo (${quarter || 'Oke-Ogere'})`;
          subCategoryLabel = 'Indigene · Resident in Ogere';
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

      const token = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64');

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
        qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${cardId}`,
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

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/Phone identifier and password are required.',
      });
    }

    try {
      const rows = await sqlQuery(
        'SELECT * FROM users WHERE email = $1 OR phone = $1 LIMIT 1',
        [identifier]
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

      const token = Buffer.from(JSON.stringify({ id: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64');

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
            qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${c.id}`,
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
            qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${user.id_card_number}`,
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
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      if (!payload.id || payload.exp < Date.now()) {
        return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
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
            qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${c.id}`,
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
            qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${user.id_card_number}`,
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

  return res.status(400).json({ success: false, error: 'Unknown action.' });
}
