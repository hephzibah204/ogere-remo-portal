/**
 * locationService.ts
 * Ogere Remo Civic Portal — Complete Device Intelligence & Location Engine
 *
 * Captures for every SOS / incident report:
 *  1. Exact GPS coordinates (lat, lng, accuracy)
 *  2. Real public IP address
 *  3. Google Maps pin URL
 *  4. Platform (Android / iOS)
 *  5. OS version
 *  6. Device model
 *  7. Network type & carrier (WiFi / 4G / 3G / offline)
 *  8. Screen dimensions & pixel ratio
 *  9. Locale / language
 * 10. Device timezone
 * 11. Battery level (if available)
 * 12. App version string
 */

import { Linking, Alert, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface DeviceIntelligence {
  // Platform
  platform: 'android' | 'ios' | 'unknown';
  osVersion: string;
  deviceModel: string;

  // Network
  networkType: string;      // 'wifi' | 'cellular' | 'none' | 'unknown'
  networkGeneration: string; // '2g' | '3g' | '4g' | '5g' | 'unknown'
  carrier: string;

  // Screen
  screenWidth: number;
  screenHeight: number;

  // Locale & Time
  locale: string;
  timezone: string;

  // Battery
  batteryLevel: number | null; // 0–100 or null if unavailable

  // App
  appVersion: string;
}

export interface DeviceLocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  ipAddress: string;
  googleMapsUrl: string;
  isGpsPrecise: boolean;
  timestamp: string;
  device: DeviceIntelligence;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const LAST_KNOWN_IP_KEY = '@ogere_last_known_ip';
const LAST_KNOWN_LOC_KEY = '@ogere_last_known_location';
const OGERE_CENTER_LAT = 6.9388;
const OGERE_CENTER_LNG = 3.6437;
const APP_VERSION = '2.0.1'; // Update when releasing new APK

// ─── Device Intelligence ────────────────────────────────────────────────────────

/**
 * Collect comprehensive device metadata
 */
export async function getDeviceIntelligence(): Promise<DeviceIntelligence> {
  const { width, height } = Dimensions.get('screen');

  // Platform & OS
  const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'unknown';
  const osVersion = String(Platform.Version || 'unknown');

  // Device Model — read from Platform constants
  let deviceModel = 'unknown';
  try {
    if (Platform.OS === 'android') {
      const constants = Platform.constants as any;
      const brand = constants?.Brand || constants?.brand || '';
      const model = constants?.Model || constants?.model || '';
      const manufacturer = constants?.Manufacturer || constants?.manufacturer || '';
      deviceModel = [manufacturer, brand, model].filter(Boolean).join(' ').trim() || 'Android Device';
    } else if (Platform.OS === 'ios') {
      const constants = Platform.constants as any;
      deviceModel = constants?.systemName || constants?.interfaceIdiom || 'iOS Device';
    }
  } catch (_) {}

  // Network type & generation
  let networkType = 'unknown';
  let networkGeneration = 'unknown';
  let carrier = 'unknown';
  try {
    const state = await NetInfo.fetch();
    networkType = state.type || 'unknown';
    if (state.type === 'cellular') {
      const cellDetails = state.details as any;
      networkGeneration = cellDetails?.cellularGeneration || 'unknown';
      carrier = cellDetails?.carrier || 'unknown';
    } else if (state.type === 'wifi') {
      networkGeneration = 'wifi';
      carrier = 'WiFi';
    }
  } catch (_) {}

  // Locale & Timezone
  let locale = 'en';
  let timezone = 'UTC';
  try {
    locale = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.locale || 'en';
    timezone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'UTC';
  } catch (_) {}

  // Battery level — use the web Battery API if available in RN WebView context
  let batteryLevel: number | null = null;
  try {
    const nav = navigator as any;
    if (typeof nav?.getBattery === 'function') {
      const bat = await nav.getBattery();
      batteryLevel = Math.round(bat.level * 100);
    }
  } catch (_) {}

  return {
    platform,
    osVersion,
    deviceModel,
    networkType,
    networkGeneration,
    carrier,
    screenWidth: Math.round(width),
    screenHeight: Math.round(height),
    locale,
    timezone,
    batteryLevel,
    appVersion: APP_VERSION,
  };
}

// ─── IP Address ────────────────────────────────────────────────────────────────

export async function getDevicePublicIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        await AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data.ip).catch(() => {});
        return data.ip;
      }
    }
  } catch (err) {
    console.warn('[LocationService] IP fetch primary failed, trying fallback');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res2 = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.ip) {
        await AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data2.ip).catch(() => {});
        return data2.ip;
      }
    }
  } catch (_) {}

  const cachedIp = await AsyncStorage.getItem(LAST_KNOWN_IP_KEY).catch(() => null);
  return cachedIp || '127.0.0.1';
}

// ─── GPS ───────────────────────────────────────────────────────────────────────

/**
 * Request location permission on Android (runtime permission required for GPS).
 * On iOS, the permission dialog is triggered automatically by getCurrentPosition.
 * Returns true if permission granted (or on iOS), false if denied.
 */
async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true; // iOS handles it natively
  try {
    const { PermissionsAndroid } = require('react-native');
    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (already) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '📍 Location Access Required',
        message:
          'Ogere Emergency Portal needs your EXACT location to send precise GPS coordinates to responders.\n\nWithout this, officers cannot navigate to you.',
        buttonPositive: '✅ Allow Location',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Later',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('[LocationService] Permission request error:', err);
    return false; // Proceed anyway — will fail gracefully
  }
}

function getGpsCoordinates(): Promise<{
  lat: number; lng: number; accuracy: number | null;
  altitude: number | null; altitudeAccuracy: number | null;
  heading: number | null; speed: number | null;
}> {
  return new Promise((resolve, reject) => {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
    if (!geo || typeof geo.getCurrentPosition !== 'function') {
      return reject(new Error('Geolocation API not available.'));
    }
    geo.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        altitude: pos.coords.altitude ?? null,
        altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
        heading: pos.coords.heading ?? null,
        speed: pos.coords.speed ?? null,
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 } as any
    );
  });
}

async function getIpCoordinates(ip: string): Promise<{ lat: number; lng: number; accuracy: number | null }> {
  // Try ipapi.co first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return { lat: data.latitude, lng: data.longitude, accuracy: 500 };
      }
    }
  } catch (_) {}

  // Fallback: ipinfo.io
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 4000);
    const res2 = await fetch(`https://ipinfo.io/${ip}/json`, { signal: controller2.signal });
    clearTimeout(timeoutId2);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.loc) {
        const [lat, lng] = data2.loc.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, accuracy: 1000 };
        }
      }
    }
  } catch (_) {}

  return { lat: OGERE_CENTER_LAT, lng: OGERE_CENTER_LNG, accuracy: null };
}

// ─── Main Export ────────────────────────────────────────────────────────────────

/**
 * Get complete device location + full device intelligence in one call.
 * This is the function to call from SosModal, IncidentReportScreen, etc.
 */
export async function getExactDeviceLocation(): Promise<DeviceLocationData> {
  // Step 0: Ensure Android location permission is granted (shows OS dialog if needed)
  const permissionGranted = await ensureLocationPermission();
  if (!permissionGranted) {
    Alert.alert(
      '📍 Location Access Denied',
      'Without location access, your exact GPS coordinates cannot be sent to responders. Please go to Settings → Apps → Ogere → Permissions → Location → Allow.\n\nWe will use your IP address as a fallback location.',
      [{ text: 'OK', style: 'default' }]
    );
  }

  // Run IP and device intel in parallel (don't block GPS acquisition)
  const [ipAddress, device] = await Promise.all([
    getDevicePublicIp(),
    getDeviceIntelligence(),
  ]);

  let lat = OGERE_CENTER_LAT;
  let lng = OGERE_CENTER_LNG;
  let accuracy: number | null = null;
  let altitude: number | null = null;
  let altitudeAccuracy: number | null = null;
  let heading: number | null = null;
  let speed: number | null = null;
  let isGpsPrecise = false;

  // 1. Try hardware GPS first
  try {
    const gps = await getGpsCoordinates();
    lat = gps.lat;
    lng = gps.lng;
    accuracy = gps.accuracy;
    altitude = gps.altitude;
    altitudeAccuracy = gps.altitudeAccuracy;
    heading = gps.heading;
    speed = gps.speed;
    isGpsPrecise = true;
  } catch (gpsErr) {
    console.warn('[LocationService] GPS unavailable, using IP geo fallback:', gpsErr);
    const ipGeo = await getIpCoordinates(ipAddress);
    lat = ipGeo.lat;
    lng = ipGeo.lng;
    accuracy = ipGeo.accuracy;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const result: DeviceLocationData = {
    latitude: lat,
    longitude: lng,
    altitude,
    accuracy,
    altitudeAccuracy,
    heading,
    speed,
    ipAddress,
    googleMapsUrl,
    isGpsPrecise,
    timestamp: new Date().toISOString(),
    device,
  };

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
