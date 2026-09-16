/**
 * locationService.ts
 * Ogere Remo Civic Portal — Precision Device Location & IP Telemetry Engine
 *
 * Acquires:
 * 1. Exact GPS coordinates (latitude, longitude, accuracy)
 * 2. Real Public IP address of the device
 * 3. One-tap Google Maps link for emergency responders
 */

import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeviceLocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  ipAddress: string;
  googleMapsUrl: string;
  isGpsPrecise: boolean;
  timestamp: string;
}

const LAST_KNOWN_IP_KEY = '@ogere_last_known_ip';
const LAST_KNOWN_LOC_KEY = '@ogere_last_known_location';

// Default reference coordinates for Ogere Remo center
const OGERE_CENTER_LAT = 6.9388;
const OGERE_CENTER_LNG = 3.6437;

/**
 * Fetch the public IP address of the mobile device
 */
export async function getDevicePublicIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        await AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data.ip).catch(() => {});
        return data.ip;
      }
    }
  } catch (err) {
    console.warn('[LocationService] Public IP fetch warning, trying fallback:', err);
  }

  // Secondary fallback for IP
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res2 = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.ip) {
        await AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data2.ip).catch(() => {});
        return data2.ip;
      }
    }
  } catch (_) {}

  // Return cached IP if available, or placeholder
  const cachedIp = await AsyncStorage.getItem(LAST_KNOWN_IP_KEY).catch(() => null);
  return cachedIp || '127.0.0.1';
}

/**
 * Acquire exact GPS coordinates from device
 */
function getGpsCoordinates(): Promise<{ lat: number; lng: number; accuracy: number | null }> {
  return new Promise((resolve, reject) => {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;

    if (!geo || typeof geo.getCurrentPosition !== 'function') {
      return reject(new Error('Geolocation API not available in current environment.'));
    }

    geo.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 10000,
      } as any
    );
  });
}

/**
 * Fetch approximate coordinates from IP geolocation if GPS is unavailable
 */
async function getIpCoordinates(ip: string): Promise<{ lat: number; lng: number; accuracy: number | null }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 500, // ~500m accuracy for IP-based positioning
        };
      }
    }
  } catch (_) {}

  return {
    lat: OGERE_CENTER_LAT,
    lng: OGERE_CENTER_LNG,
    accuracy: null,
  };
}

/**
 * Get comprehensive device location & IP data
 */
export async function getExactDeviceLocation(): Promise<DeviceLocationData> {
  const ipAddress = await getDevicePublicIp();
  let lat = OGERE_CENTER_LAT;
  let lng = OGERE_CENTER_LNG;
  let accuracy: number | null = null;
  let isGpsPrecise = false;

  // 1. Try hardware GPS first
  try {
    const gps = await getGpsCoordinates();
    lat = gps.lat;
    lng = gps.lng;
    accuracy = gps.accuracy;
    isGpsPrecise = true;
  } catch (gpsErr) {
    console.warn('[LocationService] Hardware GPS unavailable, falling back to IP positioning:', gpsErr);

    // 2. Fallback to IP Geolocation
    const ipGeo = await getIpCoordinates(ipAddress);
    lat = ipGeo.lat;
    lng = ipGeo.lng;
    accuracy = ipGeo.accuracy;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const result: DeviceLocationData = {
    latitude: lat,
    longitude: lng,
    accuracy,
    ipAddress,
    googleMapsUrl,
    isGpsPrecise,
    timestamp: new Date().toISOString(),
  };

  // Cache last known location
  AsyncStorage.setItem(LAST_KNOWN_LOC_KEY, JSON.stringify(result)).catch(() => {});

  return result;
}

/**
 * Launch Google Maps on the device with the exact pinpointed coordinates
 */
export function openInGoogleMaps(latitude: number, longitude: number, label: string = 'Emergency Location'): void {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Google Maps Link', `Coordinates: ${latitude}, ${longitude}\nURL: ${url}`);
  });
}
