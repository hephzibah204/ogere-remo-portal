import { dbGet, dbSet, dbDelete } from './storage';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

export async function getUsers() {
  return (await dbGet(USERS_KEY)) || [];
}

export async function signUp({ name, email, username, password }) {
  const users = await getUsers();
  if (users.find(u => u.username === username)) return { ok: false, error: 'Username already taken.' };
  if (users.find(u => u.email === email)) return { ok: false, error: 'Email already registered.' };
  const user = {
    id: 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name, email, username, password,
    role: 'user',
    created: new Date().toISOString(),
    avatar: '',
    bio: '',
    location: '',
  };
  users.push(user);
  await dbSet(USERS_KEY, users);
  await dbSet(SESSION_KEY, { userId: user.id });
  return { ok: true, user };
}

export async function signIn(username, password) {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return { ok: false, error: 'Invalid username or password.' };
  await dbSet(SESSION_KEY, { userId: user.id });
  return { ok: true, user };
}

export async function signOut() {
  await dbDelete(SESSION_KEY);
}

export async function getSession() {
  const session = await dbGet(SESSION_KEY);
  if (!session || !session.userId) return null;
  const users = await getUsers();
  const user = users.find(u => u.id === session.userId);
  return user || null;
}

export async function updateProfile(userId, updates) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found.' };
  users[idx] = { ...users[idx], ...updates };
  await dbSet(USERS_KEY, users);
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
