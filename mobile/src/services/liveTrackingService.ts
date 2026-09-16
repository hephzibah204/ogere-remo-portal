/**
 * liveTrackingService.ts
 * Ogere Remo Civic App — Real-Time Tactical GPS Location Radar Engine
 *
 * Allows a citizen during an emergency/hostage/robbery/corridor transit
 * to perpetually stream their moving GPS coordinates, speed, and heading to Ogere
 * Security Command (Police, FRSC, So-Safe, Palace Vigilante).
 */

import { API_BASE_URL } from '../database/syncManager';

export interface LiveLocationData {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;     // in km/h
  accuracy?: number | null;  // in meters
  timestamp: string;
}

export interface LiveTrackingState {
  isActive: boolean;
  incidentId: string | null;
  lastPingAt: string | null;
  pingCount: number;
  currentCoords: LiveLocationData | null;
  error: string | null;
}

type LiveTrackingListener = (state: LiveTrackingState) => void;

class LiveTrackingService {
  private activeIncidentId: string | null = null;
  private watchId: number | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<LiveTrackingListener> = new Set();
  private pingCount = 0;
  private currentCoords: LiveLocationData | null = null;
  private lastPingAt: string | null = null;
  private error: string | null = null;

  // Initial reference coordinates (Ogere Remo center)
  private currentLat = 6.9371;
  private currentLng = 3.6335;

  /**
   * Subscribe to live location tracking state updates
   */
  public subscribe(listener: LiveTrackingListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): LiveTrackingState {
    return {
      isActive: this.activeIncidentId !== null,
      incidentId: this.activeIncidentId,
      lastPingAt: this.lastPingAt,
      pingCount: this.pingCount,
      currentCoords: this.currentCoords,
      error: this.error,
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('[LiveTracking] Listener error:', err);
      }
    });
  }

  /**
   * Start perpetual live location sharing for a given emergency incident
   * Pings every 4 seconds with high-frequency telemetry radar
   */
  public startTracking(incidentId: string, initialCoords?: { lat: number; lng: number }) {
    if (this.activeIncidentId === incidentId) return;

    this.stopTracking(false); // Stop any previous session without sending ended flag

    this.activeIncidentId = incidentId;
    this.pingCount = 0;
    this.error = null;

    if (initialCoords) {
      this.currentLat = initialCoords.lat;
      this.currentLng = initialCoords.lng;
    }

    console.log(`[LiveTracking] Started real-time live location radar for incident: ${incidentId}`);

    // Try standard Geolocation API if available
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;

    if (geo && typeof geo.watchPosition === 'function') {
      try {
        this.watchId = geo.watchPosition(
          (pos) => {
            const { latitude, longitude, heading, speed, accuracy } = pos.coords;
            this.currentLat = latitude;
            this.currentLng = longitude;
            this.currentCoords = {
              latitude,
              longitude,
              heading: heading ?? null,
              speed: speed ? Math.round(speed * 3.6) : null, // convert m/s to km/h
              accuracy: accuracy ? Math.round(accuracy) : null,
              timestamp: new Date().toISOString(),
            };
          },
          (err) => {
            console.warn('[LiveTracking] Native watchPosition warning:', err.message);
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 2, // Every 2 meters of movement
            maximumAge: 3000,
          } as any
        );
      } catch (e) {
        console.warn('[LiveTracking] Could not attach watchPosition:', e);
      }
    }

    // Immediately send the first ping
    this.sendPing();

    // Loop ping every 4.5 seconds
    this.timerId = setInterval(() => {
      this.sendPing();
    }, 4500);

    this.notifyListeners();
  }

  /**
   * Send a live telemetry ping to the Ogere Security Command API
   * Queries real hardware GPS on every tick to capture actual user movement (like WhatsApp Live Location)
   */
  private async sendPing() {
    if (!this.activeIncidentId) return;

    // Attempt to query real-time hardware GPS on each tick
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
    if (geo && typeof geo.getCurrentPosition === 'function') {
      try {
        await new Promise<void>((resolve) => {
          geo.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, heading, speed, accuracy } = pos.coords;
              this.currentLat = latitude;
              this.currentLng = longitude;
              this.currentCoords = {
                latitude,
                longitude,
                heading: heading ?? null,
                speed: speed ? Math.round(speed * 3.6) : null, // km/h
                accuracy: accuracy ? Math.round(accuracy) : null,
                timestamp: new Date().toISOString(),
              };
              resolve();
            },
            (err) => {
              console.warn('[LiveTracking] Periodic GPS poll fallback:', err.message);
              resolve();
            },
            { enableHighAccuracy: true, timeout: 3500, maximumAge: 1000 } as any
          );
        });
      } catch (_) {}
    }

    const lat = this.currentCoords ? this.currentCoords.latitude : this.currentLat;
    const lng = this.currentCoords ? this.currentCoords.longitude : this.currentLng;

    const payload = {
      incidentId: this.activeIncidentId,
      latitude: lat,
      longitude: lng,
      heading: this.currentCoords?.heading ?? null,
      speed: this.currentCoords?.speed ?? null,
      accuracy: this.currentCoords?.accuracy ?? null,
      isEnded: false,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/live-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        this.pingCount++;
        this.lastPingAt = new Date().toLocaleTimeString();
        this.currentCoords = {
          latitude: lat,
          longitude: lng,
          heading: payload.heading,
          speed: payload.speed,
          accuracy: payload.accuracy,
          timestamp: new Date().toISOString(),
        };
        this.error = null;
      }
    } catch (err: any) {
      console.warn('[LiveTracking] Ping network error:', err.message);
      this.error = 'Live ping pending network reconnect...';
    } finally {
      this.notifyListeners();
    }
  }

  /**
   * Stop live location sharing
   */
  public stopTracking(notifyServer = true) {
    if (!this.activeIncidentId) return;

    const incidentId = this.activeIncidentId;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.watchId !== null) {
      const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
      if (geo && typeof geo.clearWatch === 'function') {
        geo.clearWatch(this.watchId);
      }
      this.watchId = null;
    }

    if (notifyServer) {
      fetch(`${API_BASE_URL}/api/live-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          isEnded: true,
        }),
      }).catch(() => {});
    }

    this.activeIncidentId = null;
    this.notifyListeners();
    console.log(`[LiveTracking] Ended live location sharing for ${incidentId}`);
  }
}

export const liveTrackingService = new LiveTrackingService();
