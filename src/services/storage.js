import { dbGetAll, dbSetCollection } from './db';

const STORAGE_PREFIX = 'ogere-';

export async function dbGet(key) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      return JSON.parse(raw);
    }
    // Check if it exists in db collections
    return await dbGetAll(key.replace(/^cms-/, ''));
  } catch (err) {
    console.error('dbGet Error:', err);
    return null;
  }
}

export async function dbSet(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    // Also sync with db.js if applicable
    await dbSetCollection(key.replace(/^cms-/, ''), value);
    window.dispatchEvent(new CustomEvent(`storage-${key}-updated`, { detail: value }));
    return true;
  } catch (err) {
    console.error('dbSet Error:', err);
    return false;
  }
}

export async function dbDelete(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    window.dispatchEvent(new CustomEvent(`storage-${key}-updated`, { detail: null }));
    return true;
  } catch (err) {
    console.error('dbDelete Error:', err);
    return false;
  }
}

export function getWithFallback(key, fallback) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
