/**
 * locationService.ts
 * Ogere Remo Civic Portal — High-Precision Device Intelligence & Location Engine
 *
 * Captures for every SOS / incident report:
 *  1. Exact GPS coordinates (multi-sample satellite lock: lat, lng, accuracy)
 *  2. Hyper-local Ogere landmark geocoding & nearest sector resolution
 *  3. Real hardware battery level & charging state via NativeBatteryModule
 *  4. Real public IP address (with multi-provider fallback)
 *  5. High-resolution rooftop satellite Google Maps URL (z=19&t=k)
 *  6. Platform (Android / iOS), OS version, device model
 *  7. Network type & carrier (WiFi / 4G / 5G / cellular)
 *  8. Screen dimensions & pixel ratio
 *  9. Locale / language & device timezone
 * 10. Turn-by-turn navigation & out-of-town detection
 */

import { Linking, Alert, Platform, Dimensions, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  resolveOgereLocation,
  getOgereMapUrls,
  OgereLocationResolution,
  OGERE_LANDMARKS,
  isInsideOgere,
} from './ogereGeoEngine';
import { reverseGeocodeMobile, getStandardMapUrls } from './liveLocationEngine';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface DeviceIntelligence {
  platform: 'android' | 'ios' | 'unknown';
  osVersion: string;
  deviceModel: string;
  networkType: string;
  networkGeneration: string;
  carrier: string;
  screenWidth: number;
  screenHeight: number;
  locale: string;
  timezone: string;
  batteryLevel: number | null; // 0–100% or null
  isCharging: boolean;
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
  fullAddress: string;
  googleMapsUrl: string;
  satelliteMapsUrl: string;
  turnByTurnUrl: string;
  directionsUrl: string;
  isGpsPrecise: boolean;
  isInsideOgere: boolean;
  timestamp: string;
  ogereLocation: OgereLocationResolution;
  device: DeviceIntelligence;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const LAST_KNOWN_IP_KEY = '@ogere_last_known_ip';
const LAST_KNOWN_LOC_KEY = '@ogere_last_known_location';
const OGERE_CENTER_LAT = 6.9388;
const OGERE_CENTER_LNG = 3.6437;
const APP_VERSION = '2.1.0';

// ─── Hardware Battery Engine ───────────────────────────────────────────────────

/**
 * Read physical hardware battery level from Android BatteryManager or Web Battery API
 */
export async function getHardwareBattery(): Promise<{ level: number | null; isCharging: boolean }> {
  // 1. Android Native Module (direct OS BatteryManager)
  try {
    if (NativeModules.NativeBatteryModule?.getBatteryInfo) {
      const info = await NativeModules.NativeBatteryModule.getBatteryInfo();
      if (info && typeof info.level === 'number' && info.level >= 0) {
        return { level: info.level, isCharging: !!info.isCharging };
      }
    }
  } catch (err) {
    console.warn('[LocationService] Native battery read exception:', err);
  }

  // 2. Web context fallback (if running in mobile web / Chrome)
  try {
    const nav = navigator as any;
    if (typeof nav?.getBattery === 'function') {
      const bat = await nav.getBattery();
      return {
        level: Math.round(bat.level * 100),
        isCharging: !!bat.charging,
      };
    }
  } catch (_) {}

  return { level: null, isCharging: false };
}

// ─── Device Intelligence ────────────────────────────────────────────────────────

export async function getDeviceIntelligence(): Promise<DeviceIntelligence> {
  const { width, height } = Dimensions.get('screen');

  const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'unknown';
  const osVersion = String(Platform.Version || 'unknown');

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

  let networkType = 'unknown';
  let networkGeneration = 'unknown';
  let carrier = 'unknown';
  try {
    const state = await NetInfo.fetch();
    networkType = state.type || 'unknown';
    if (state.type === 'cellular') {
      const cellDetails = state.details as any;
      networkGeneration = cellDetails?.cellularGeneration || 'unknown';
      carrier = cellDetails?.carrier || 'Cellular';
    } else if (state.type === 'wifi') {
      networkGeneration = 'wifi';
      carrier = 'WiFi Network';
    }
  } catch (_) {}

  let locale = 'en';
  let timezone = 'Africa/Lagos';
  try {
    locale = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.locale || 'en';
    timezone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'Africa/Lagos';
  } catch (_) {}

  const battery = await getHardwareBattery();

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
    batteryLevel: battery.level,
    isCharging: battery.isCharging,
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
        AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data.ip).catch(() => {});
        return data.ip;
      }
    }
  } catch (_) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res2 = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.ip) {
        AsyncStorage.setItem(LAST_KNOWN_IP_KEY, data2.ip).catch(() => {});
        return data2.ip;
      }
    }
  } catch (_) {}

  const cachedIp = await AsyncStorage.getItem(LAST_KNOWN_IP_KEY).catch(() => null);
  return cachedIp || '127.0.0.1';
}

// ─── High-Precision GPS Lock ───────────────────────────────────────────────────

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const { PermissionsAndroid } = require('react-native');
    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (already) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '📍 Precise GPS Location Required',
        message:
          'Ogere Emergency Portal requires satellite GPS to pinpoint your exact compound, street, or expressway position for responders in Ogere Remo.\n\nAllowing this gives officers precision navigation.',
        buttonPositive: '✅ Allow Precise Location',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Later',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('[LocationService] Permission request error:', err);
    return false;
  }
}

/**
 * Multi-sample satellite GPS acquisition
 * Gathers incoming location fixes over a lock window and selects the one with the highest precision (lowest accuracy radius).
 * Resolves early if accuracy <= 12 meters (military / high satellite lock).
 */
export function acquireHighPrecisionGps(maxWaitMs = 6000, targetAccuracyMeters = 12): Promise<{
  lat: number;
  lng: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}> {
  return new Promise((resolve, reject) => {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
    if (!geo || typeof geo.getCurrentPosition !== 'function') {
      return reject(new Error('Geolocation API not available.'));
    }

    let bestFix: any = null;
    let isFinished = false;
    let watchId: number | null = null;

    const cleanup = () => {
      if (watchId !== null && typeof geo.clearWatch === 'function') {
        try {
          geo.clearWatch(watchId);
        } catch (_) {}
      }
    };

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      cleanup();
      if (bestFix) {
        resolve(bestFix);
      } else {
        reject(new Error('GPS satellite lock timed out.'));
      }
    };

    const timer = setTimeout(finish, maxWaitMs);

    const onFix = (pos: any) => {
      const fix = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        altitude: pos.coords.altitude ?? null,
        altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
        heading: pos.coords.heading ?? null,
        speed: pos.coords.speed ?? null,
      };

      const curAcc = fix.accuracy ?? 9999;
      const bestAcc = bestFix ? (bestFix.accuracy ?? 9999) : 9999;

      if (!bestFix || curAcc < bestAcc) {
        bestFix = fix;
      }

      // If we got precision satellite lock, resolve immediately!
      if (curAcc <= targetAccuracyMeters) {
        clearTimeout(timer);
        finish();
      }
    };

    const onError = () => {
      if (!bestFix) {
        geo.getCurrentPosition(onFix, () => finish(), {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 0,
        } as any);
      }
    };

    if (typeof geo.watchPosition === 'function') {
      try {
        watchId = geo.watchPosition(onFix, onError, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: maxWaitMs,
        } as any);
      } catch (_) {
        geo.getCurrentPosition(onFix, onError, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: maxWaitMs,
        } as any);
      }
    } else {
      geo.getCurrentPosition(onFix, onError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: maxWaitMs,
      } as any);
    }
  });
}

// ─── Main Export ────────────────────────────────────────────────────────────────

/**
 * Get complete device location + Ogere landmark resolution + hardware telemetry
 */
export async function getExactDeviceLocation(): Promise<DeviceLocationData> {
  const permissionGranted = await ensureLocationPermission();
  if (!permissionGranted) {
    Alert.alert(
      '📍 Precise Location Disabled',
      'Please allow GPS access in device settings for pinpoint accuracy in Ogere Remo.',
      [{ text: 'OK', style: 'default' }]
    );
  }

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

  // 1. Acquire multi-sample satellite GPS lock with progressive refinement
  try {
    const gps = await acquireHighPrecisionGps(6000, 15);
    lat = gps.lat;
    lng = gps.lng;
    accuracy = gps.accuracy;
    altitude = gps.altitude;
    altitudeAccuracy = gps.altitudeAccuracy;
    heading = gps.heading;
    speed = gps.speed;
    isGpsPrecise = true;
  } catch (gpsErr) {
    console.warn('[LocationService] GPS lock timed out or unavailable:', gpsErr);
    // Fast IP Geolocation fallback before defaulting to Ogere Center anchor
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const ipRes = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
      clearTimeout(t);
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
          lat = ipData.latitude;
          lng = ipData.longitude;
          accuracy = 500;
        }
      }
    } catch (_) {}
    if (lat === OGERE_CENTER_LAT && lng === OGERE_CENTER_LNG) {
      accuracy = 250;
    }
  }

  // 2. Real-time reverse geocode coordinates to street address & sector
  const revGeo = await reverseGeocodeMobile(lat, lng);
  const insideOgere = isInsideOgere(lat, lng);
  const ogereLocation = resolveOgereLocation(lat, lng, accuracy);

  const result: DeviceLocationData = {
    latitude: lat,
    longitude: lng,
    altitude,
    accuracy,
    altitudeAccuracy,
    heading,
    speed,
    ipAddress,
    fullAddress: revGeo.fullAddress,
    googleMapsUrl: revGeo.googleMapsUrl,
    satelliteMapsUrl: revGeo.satelliteMapsUrl,
    turnByTurnUrl: revGeo.directionsUrl,
    directionsUrl: revGeo.directionsUrl,
    isGpsPrecise,
    isInsideOgere: insideOgere,
    timestamp: new Date().toISOString(),
    ogereLocation,
    device,
  };

  AsyncStorage.setItem(LAST_KNOWN_LOC_KEY, JSON.stringify(result)).catch(() => {});
  return result;
}

/**
 * Launch Google Maps on the device with guaranteed pinpoint drop
 */
export function openInGoogleMaps(
  latitude: number,
  longitude: number,
  label: string = 'Emergency Location',
  preferSatellite: boolean = true
): void {
  const mapUrls = getStandardMapUrls(latitude, longitude);
  const targetUrl = preferSatellite ? mapUrls.satelliteMapsUrl : mapUrls.googleMapsUrl;

  Linking.openURL(targetUrl).catch(() => {
    Alert.alert('Google Maps Link', `Coordinates: ${latitude}, ${longitude}\nURL: ${targetUrl}`);
  });
}
