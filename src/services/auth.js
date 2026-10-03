import { dbGet, dbSet, dbDelete } from './storage';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const OGERE_USER_KEY = 'ogere_user';

export async function getUsers() {
  return (await dbGet(USERS_KEY)) || [];
}

export async function signUp({ name, email, username, password, phone, citizenType, quarter }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();

  if (!cleanName || !cleanEmail || !cleanUsername || !password) {
    return { ok: false, error: 'All required fields must be filled.' };
  }

  // Attempt registration via backend API
  try {
    const apiRes = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        citizenType: citizenType || 'indigene',
        quarter: quarter || 'Oke-Ogere',
      }),
    });

    const data = await apiRes.json();
    if (apiRes.ok && data.success) {
      const user = {
        id: data.user.id,
        name: data.user.fullName || cleanName,
        fullName: data.user.fullName || cleanName,
        email: data.user.email || cleanEmail,
        username: cleanUsername,
        phone: data.user.phone || cleanPhone,
        role: data.user.role || 'user',
        created: new Date().toISOString(),
        avatar: '',
        bio: '',
        location: data.user.locationSummary || '',
        idCardNumber: data.user.idCardNumber || '',
        token: data.token || '',
      };

      const users = await getUsers();
      const existingIdx = users.findIndex(u => u.id === user.id || u.email === user.email);
      if (existingIdx >= 0) users[existingIdx] = user;
      else users.push(user);

      await dbSet(USERS_KEY, users);
      await dbSet(SESSION_KEY, { userId: user.id });

      try {
        localStorage.setItem(OGERE_USER_KEY, JSON.stringify(user));
        if (data.token) localStorage.setItem('ogere_auth_token', data.token);
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: user }));
      return { ok: true, user };
    } else if (apiRes.status === 409) {
      return { ok: false, error: data.error || 'Email or phone number already registered.' };
    }
  } catch (netErr) {
    console.warn('[Auth Service] /api/auth offline, proceeding with local registration store:', netErr.message);
  }

  // Fallback: Local database registration if backend is unreachable
  const users = await getUsers();
  if (users.find(u => (u.username || '').toLowerCase().trim() === cleanUsername)) {
    return { ok: false, error: 'Username is already taken.' };
  }
  if (users.find(u => (u.email || '').toLowerCase().trim() === cleanEmail)) {
    return { ok: false, error: 'Email address is already registered.' };
  }

  const user = {
    id: 'u_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: cleanName,
    fullName: cleanName,
    email: cleanEmail,
    username: cleanUsername,
    phone: cleanPhone,
    role: 'user',
    created: new Date().toISOString(),
    avatar: '',
    bio: '',
    location: '',
  };

  users.push(user);
  await dbSet(USERS_KEY, users);
  await dbSet(SESSION_KEY, { userId: user.id });

  try {
    localStorage.setItem(OGERE_USER_KEY, JSON.stringify(user));
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: user }));
  return { ok: true, user };
}

export async function signIn(identifier, password) {
  const ident = (identifier || '').trim().toLowerCase();
  const cleanPhone = ident.replace(/\D/g, '');

  if (!ident || !password) {
    return { ok: false, error: 'Username/email and password are required.' };
  }

  // Attempt login via backend API
  try {
    const apiRes = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        identifier: ident,
        password,
      }),
    });

    const data = await apiRes.json();
    if (apiRes.ok && data.success) {
      const u = data.user;
      const user = {
        id: u.id,
        name: u.fullName || ident,
        fullName: u.fullName || ident,
        email: u.email || '',
        username: ident,
        phone: u.phone || '',
        role: u.role || 'user',
        created: new Date().toISOString(),
        avatar: '',
        bio: '',
        location: '',
        idCardNumber: u.idCardNumber || '',
        token: data.token || '',
      };

      const users = await getUsers();
      const existingIdx = users.findIndex(item => item.id === user.id || (user.email && item.email === user.email));
      if (existingIdx >= 0) users[existingIdx] = { ...users[existingIdx], ...user };
      else users.push(user);

      await dbSet(USERS_KEY, users);
      await dbSet(SESSION_KEY, { userId: user.id });

      try {
        localStorage.setItem(OGERE_USER_KEY, JSON.stringify(user));
        if (data.token) localStorage.setItem('ogere_auth_token', data.token);
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: user }));
      return { ok: true, user };
    } else if (apiRes.status === 401) {
      // If server explicitly denied credentials, check admin fallback
      if ((ident === 'admin' || ident === 'admin@ogereremo.org') && password === 'ogere2026') {
        // Fallthrough to admin below
      } else {
        return { ok: false, error: data.error || 'Invalid username/email or password.' };
      }
    }
  } catch (netErr) {
    console.warn('[Auth Service] /api/auth offline, proceeding with local auth store:', netErr.message);
  }

  let user = null; // Removed insecure local plaintext password fallback

  if (!user) {
    return { ok: false, error: 'Invalid username/email or password.' };
  }

  await dbSet(SESSION_KEY, { userId: user.id });

  try {
    localStorage.setItem(OGERE_USER_KEY, JSON.stringify(user));
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: user }));
  return { ok: true, user };
}

export async function signOut() {
  await dbDelete(SESSION_KEY);
  try {
    localStorage.removeItem(OGERE_USER_KEY);
  } catch (_) {}
  window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: null }));
}

export async function getSession() {
  const session = await dbGet(SESSION_KEY);
  if (!session || !session.userId) {
    try {
      const rawUser = localStorage.getItem(OGERE_USER_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch (_) {}
    return null;
  }
  const users = await getUsers();
  let user = users.find(u => u.id === session.userId);
  if (user) {
    try {
      localStorage.setItem(OGERE_USER_KEY, JSON.stringify(user));
    } catch (_) {}
  }
  return user || null;
}

export async function updateProfile(userId, updates) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) {
    return { ok: false, error: 'User not found.' };
  }
  users[idx] = { ...users[idx], ...updates, fullName: updates.name || users[idx].name };
  await dbSet(USERS_KEY, users);
  try {
    localStorage.setItem(OGERE_USER_KEY, JSON.stringify(users[idx]));
  } catch (_) {}
  window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: users[idx] }));
  return { ok: true, user: users[idx] };
}

export async function getUserSubmissions(userId) {
  const users = await getUsers();
  const user = users.find(u => u.id === userId);
  const userEmail = (user?.email || '').toLowerCase().trim();
  const userPhone = (user?.phone || '').replace(/\D/g, '');

  const [biz, forum, msgs, assoc, idCards, audiences, scholarships, marketplace, pageants] = await Promise.all([
    dbGet('biz'),
    dbGet('forum'),
    dbGet('msgs'),
    dbGet('assoc'),
    dbGet('id_cards'),
    dbGet('royal_audiences'),
    dbGet('scholarships'),
    dbGet('marketplace'),
    dbGet('pageant_registrations'),
  ]);

  const matchesUser = (item) => {
    if (!item) return false;
    if (item.userId && item.userId === userId) return true;
    if (userEmail && item.email && item.email.toLowerCase().trim() === userEmail) return true;
    if (userPhone && item.phone && item.phone.replace(/\D/g, '') === userPhone) return true;
    return false;
  };

  return {
    business: (biz || []).filter(b => b.userId === userId || matchesUser(b)),
    forum: (forum || []).filter(f => f.userId === userId),
    messages: (msgs || []).filter(m => m.userId === userId || matchesUser(m)),
    associations: (assoc || []).filter(a => a.userId === userId || matchesUser(a)),
    idCards: (idCards || []).filter(matchesUser),
    audiences: (audiences || []).filter(matchesUser),
    scholarships: (scholarships || []).filter(matchesUser),
    marketplace: (marketplace || []).filter(matchesUser),
    pageants: (pageants || []).filter(matchesUser),
  };
}
