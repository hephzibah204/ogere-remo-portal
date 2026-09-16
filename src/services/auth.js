import { dbGet, dbSet, dbDelete } from './storage';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const OGERE_USER_KEY = 'ogere_user';

export async function getUsers() {
  return (await dbGet(USERS_KEY)) || [];
}

export async function signUp({ name, email, username, password, phone }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();

  if (!cleanName || !cleanEmail || !cleanUsername || !password) {
    return { ok: false, error: 'All required fields must be filled.' };
  }

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
    password,
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

  const users = await getUsers();
  let user = users.find(u => {
    const userUname = (u.username || '').toLowerCase().trim();
    const userEmail = (u.email || '').toLowerCase().trim();
    const userPhone = (u.phone || '').replace(/\D/g, '');
    const matchIdent = userUname === ident || userEmail === ident || (cleanPhone.length >= 7 && userPhone === cleanPhone);
    return matchIdent && u.password === password;
  });

  // Admin fallback support for website
  if (!user && (ident === 'admin' || ident === 'admin@ogereremo.org') && password === 'ogere2026') {
    user = {
      id: 'u_admin',
      name: 'Ogere Administrator',
      fullName: 'Ogere Administrator',
      email: 'admin@ogereremo.org',
      username: 'admin',
      phone: '08033334455',
      role: 'admin',
      created: new Date().toISOString(),
      avatar: '',
      bio: 'Ogere Remo Civic Portal Administrator',
      location: 'Ogere Remo, Ogun State',
    };
  }

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
  if (!user && session.userId === 'u_admin') {
    user = {
      id: 'u_admin',
      name: 'Ogere Administrator',
      fullName: 'Ogere Administrator',
      email: 'admin@ogereremo.org',
      username: 'admin',
      phone: '08033334455',
      role: 'admin',
      created: new Date().toISOString(),
      avatar: '',
      bio: 'Ogere Remo Civic Portal Administrator',
      location: 'Ogere Remo, Ogun State',
    };
  }
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
    if (userId === 'u_admin') {
      const updatedAdmin = { id: 'u_admin', role: 'admin', ...updates };
      try {
        localStorage.setItem(OGERE_USER_KEY, JSON.stringify(updatedAdmin));
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('ogere-auth-changed', { detail: updatedAdmin }));
      return { ok: true, user: updatedAdmin };
    }
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
