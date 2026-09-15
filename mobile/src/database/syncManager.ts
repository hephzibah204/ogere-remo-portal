import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  getLastSyncTime,
  setLastSyncTime,
  updateLocalNews,
  updateLocalBusinesses,
  getPendingSubmissions,
  removePendingSubmission,
} from './sqlite';

declare const process: any;

// Default API Base URL - In development points to local or Vercel production deployment
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://ogereremo.vercel.app';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: string | null;
  pendingCount: number;
}

type SyncListener = (status: SyncStatus) => void;

class SyncManager {
  private isOnline = true;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    // Listen for network connectivity changes — wrapped in try/catch
    // because the native NetInfo module may not be ready on first launch
    try {
      NetInfo.addEventListener((state: NetInfoState) => {
        try {
          const online = Boolean(state.isConnected && state.isInternetReachable !== false);
          const changed = online !== this.isOnline;
          this.isOnline = online;
          
          if (changed) {
            this.notify();
            if (online) {
              this.performDeltaSync().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('[SyncManager] NetInfo callback error:', err);
        }
      });
    } catch (err) {
      console.warn('[SyncManager] NetInfo.addEventListener failed safely:', err);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  private async notify() {
    const lastSynced = await getLastSyncTime();
    const pending = await getPendingSubmissions();
    const status: SyncStatus = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSynced,
      pendingCount: pending.length,
    };
    for (const listener of this.listeners) {
      listener(status);
    }
  }

  public async performDeltaSync(): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline || this.isSyncing) {
      return { success: false, message: 'Offline or sync in progress.' };
    }

    this.isSyncing = true;
    this.notify();

    try {
      const since = (await getLastSyncTime()) || new Date(0).toISOString();
      const res = await fetch(`${API_BASE_URL}/api/sync?since=${encodeURIComponent(since)}`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.delta) {
          if (data.delta.news && data.delta.news.length > 0) {
            await updateLocalNews(data.delta.news);
          }
          if (data.delta.businesses && data.delta.businesses.length > 0) {
            await updateLocalBusinesses(data.delta.businesses);
          }
          if (data.timestamp) {
            await setLastSyncTime(data.timestamp);
          }
        }
      }

      // Process pending queued offline submissions
      await this.flushPendingQueue();

      this.isSyncing = false;
      this.notify();
      return { success: true, message: 'Synchronized with palace server.' };
    } catch (err: any) {
      console.warn('[SyncManager] Background sync warning:', err.message);
      this.isSyncing = false;
      this.notify();
      return { success: false, message: err.message };
    }
  }

  private async flushPendingQueue() {
    const pending = await getPendingSubmissions();
    for (const item of pending) {
      try {
        let endpoint = '';
        if (item.type === 'audience') endpoint = '/api/royal-audiences';
        if (item.type === 'id_card') endpoint = '/api/id-cards';
        if (item.type === 'incident') endpoint = '/api/incidents';

        if (endpoint) {
          const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          });

          if (res.ok) {
            await removePendingSubmission(item.id);
          }
        }
      } catch (err) {
        console.error('[SyncManager] Failed to flush item:', item.id, err);
      }
    }
  }
}

export const syncManager = new SyncManager();
