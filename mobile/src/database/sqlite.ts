import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SEED_NEWS,
  SEED_KINGS,
  SEED_BUSINESSES,
  SEED_EMERGENCY,
  SeedNewsItem,
  SeedKingItem,
  SeedBusinessItem,
  SeedEmergencyContact,
} from './seedData';

const KEYS = {
  NEWS: '@ogere_offline_news',
  KINGS: '@ogere_offline_kings',
  BUSINESSES: '@ogere_offline_businesses',
  EMERGENCY: '@ogere_offline_emergency',
  PENDING_SUBMISSIONS: '@ogere_pending_submissions',
  LAST_SYNC: '@ogere_last_sync_timestamp',
};

export interface PendingSubmission {
  id: string;
  type: 'audience' | 'incident' | 'id_card';
  data: any;
  createdAt: string;
}

export async function initOfflineStorage(): Promise<void> {
  try {
    const existingNews = await AsyncStorage.getItem(KEYS.NEWS);
    if (!existingNews) {
      await AsyncStorage.setItem(KEYS.NEWS, JSON.stringify(SEED_NEWS));
    }

    const existingKings = await AsyncStorage.getItem(KEYS.KINGS);
    if (!existingKings) {
      await AsyncStorage.setItem(KEYS.KINGS, JSON.stringify(SEED_KINGS));
    }

    const existingBiz = await AsyncStorage.getItem(KEYS.BUSINESSES);
    if (!existingBiz) {
      await AsyncStorage.setItem(KEYS.BUSINESSES, JSON.stringify(SEED_BUSINESSES));
    }

    const existingEm = await AsyncStorage.getItem(KEYS.EMERGENCY);
    if (!existingEm) {
      await AsyncStorage.setItem(KEYS.EMERGENCY, JSON.stringify(SEED_EMERGENCY));
    }
  } catch (err) {
    console.error('[Offline DB] Failed to initialize seed cache:', err);
  }
}

// --- NEWS READ / WRITE ---
export async function getLocalNews(): Promise<SeedNewsItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.NEWS);
    return raw ? JSON.parse(raw) : SEED_NEWS;
  } catch {
    return SEED_NEWS;
  }
}

export async function updateLocalNews(newItems: SeedNewsItem[]): Promise<void> {
  try {
    const current = await getLocalNews();
    const map = new Map<string, SeedNewsItem>();
    
    // Server items take precedence
    for (const item of newItems) map.set(item.id, item);
    for (const item of current) {
      if (!map.has(item.id)) map.set(item.id, item);
    }
    
    const merged = Array.from(map.values());
    await AsyncStorage.setItem(KEYS.NEWS, JSON.stringify(merged));
  } catch (err) {
    console.error('[Offline DB] Error saving news:', err);
  }
}

// --- KINGS / MONARCHY ---
export async function getLocalKings(): Promise<SeedKingItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.KINGS);
    return raw ? JSON.parse(raw) : SEED_KINGS;
  } catch {
    return SEED_KINGS;
  }
}

// --- BUSINESS DIRECTORY ---
export async function getLocalBusinesses(): Promise<SeedBusinessItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BUSINESSES);
    return raw ? JSON.parse(raw) : SEED_BUSINESSES;
  } catch {
    return SEED_BUSINESSES;
  }
}

export async function updateLocalBusinesses(newItems: SeedBusinessItem[]): Promise<void> {
  try {
    const current = await getLocalBusinesses();
    const map = new Map<string, SeedBusinessItem>();
    for (const item of newItems) map.set(item.id, item);
    for (const item of current) {
      if (!map.has(item.id)) map.set(item.id, item);
    }
    await AsyncStorage.setItem(KEYS.BUSINESSES, JSON.stringify(Array.from(map.values())));
  } catch (err) {
    console.error('[Offline DB] Error saving businesses:', err);
  }
}

// --- EMERGENCY CONTACTS ---
export async function getLocalEmergency(): Promise<SeedEmergencyContact[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EMERGENCY);
    return raw ? JSON.parse(raw) : SEED_EMERGENCY;
  } catch {
    return SEED_EMERGENCY;
  }
}

// --- PENDING OFFLINE SUBMISSIONS QUEUE ---
export async function queueOfflineSubmission(type: PendingSubmission['type'], data: any): Promise<PendingSubmission> {
  const item: PendingSubmission = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type,
    data,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = await AsyncStorage.getItem(KEYS.PENDING_SUBMISSIONS);
    const list: PendingSubmission[] = raw ? JSON.parse(raw) : [];
    list.push(item);
    await AsyncStorage.setItem(KEYS.PENDING_SUBMISSIONS, JSON.stringify(list));
  } catch (err) {
    console.error('[Offline DB] Error queueing submission:', err);
  }

  return item;
}

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PENDING_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function removePendingSubmission(id: string): Promise<void> {
  try {
    const list = await getPendingSubmissions();
    const filtered = list.filter(item => item.id !== id);
    await AsyncStorage.setItem(KEYS.PENDING_SUBMISSIONS, JSON.stringify(filtered));
  } catch (err) {
    console.error('[Offline DB] Error removing submission:', err);
  }
}

// --- SYNC TIMESTAMP ---
export async function getLastSyncTime(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.LAST_SYNC);
  } catch {
    return null;
  }
}

export async function setLastSyncTime(timestamp: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, timestamp);
  } catch {}
}
