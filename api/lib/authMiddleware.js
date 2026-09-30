import { sqlQuery } from './db.js';

const ADMIN_ROLES = new Set(['admin', 'ocda_admin', 'palace_protocol', 'super_admin']);

/**
 * Validates request authorization header.
 * Accepts:
 * 1. Bearer <token> where token is a base64 encoded user session { id, exp }
 * 2. Static admin secret key matching process.env.ADMIN_API_KEY or fallback master pass
 */
export async function verifyAdminAuth(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!authHeader) {
    return { ok: false, error: 'Missing Authorization header. Administrative access token required.' };
  }

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1].trim() : authHeader.trim();

  // Check if admin static token provided (for secure automated backend webhooks)
  const masterKey = process.env.ADMIN_API_KEY;
  if (masterKey && token === masterKey) {
    return { ok: true, user: { id: 'admin_key', role: 'super_admin' } };
  }

  // Decode session token
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.id) {
      return { ok: false, error: 'Invalid token structure.' };
    }

    if (parsed.exp && Date.now() > parsed.exp) {
      return { ok: false, error: 'Authorization token has expired. Please sign in again.' };
    }

    // Look up user in database
    const users = await sqlQuery('SELECT id, full_name, role, is_officer_verified FROM users WHERE id = $1 LIMIT 1', [parsed.id]);
    if (!users || users.length === 0) {
      return { ok: false, error: 'Authorized administrative user account not found.' };
    }

    const user = users[0];
    if (!ADMIN_ROLES.has(user.role)) {
      return { ok: false, error: `Forbidden: User role "${user.role}" does not have administrative privileges.` };
    }

    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: 'Malformed or invalid authorization token.' };
  }
}
