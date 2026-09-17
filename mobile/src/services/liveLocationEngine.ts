/**
 * liveLocationEngine.ts
 * Mobile High-Precision GPS Acquisition, Real-Time Reverse/Forward Geocoding, and Google Maps Navigation
 */

import { Linking, Alert } from 'react-native';
import { OGERE_LANDMARKS, resolveOgereLocation } from './ogereGeoEngine';
import { API_BASE_URL } from '../database/syncManager';

export interface GeocodedPlace {
  id: string;
  name: string;
  address: string;
  sector: string;
  latitude: number;
  longitude: number;
  isLocal: boolean;
  googleMapsUrl: string;
  directionsUrl: string;
  satelliteMapsUrl: string;
}

export interface PreciseLocationFix {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  fullAddress: string;
  nearestLandmark: string;
  sector: string;
  googleMapsUrl: string;
  directionsUrl: string;
  satelliteMapsUrl: string;
  isGpsPrecise: boolean;
  source: string;
}

export function getStandardMapUrls(lat: number, lng: number) {
  const safeLat = Number(lat || 6.9388).toFixed(6);
  const safeLng = Number(lng || 3.6437).toFixed(6);

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`,
    satelliteMapsUrl: `https://www.google.com/maps?q=${safeLat},${safeLng}&ll=${safeLat},${safeLng}&z=19&t=k`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}&travelmode=driving`,
  };
}

/**
 * Real-Time Reverse Geocoding for Mobile: Coordinates -> Real Street Address
 */
export async function reverseGeocodeMobile(lat: number, lng: number): Promise<{
  fullAddress: string;
  nearestLandmark: string;
  sector: string;
  googleMapsUrl: string;
  directionsUrl: string;
  satelliteMapsUrl: string;
}> {
  const maps = getStandardMapUrls(lat, lng);

  // 1. Try server endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/api/geocode?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.address) {
        return {
          fullAddress: data.address,
          nearestLandmark: data.nearestLandmark,
          sector: data.landmarkSector,
          ...maps,
        };
      }
    }
  } catch (_) {}

  // 2. Direct Nominatim fallback
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'OgereRemoMobile/2.1',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    if (nomRes.ok) {
      const nom = await nomRes.json();
      const addr = nom.address || {};
      const road = addr.road || addr.pedestrian || addr.street || '';
      const suburb = addr.suburb || addr.quarter || addr.neighbourhood || '';
      const town = addr.town || addr.city || 'Ogere Remo';
      const state = addr.state || 'Ogun State';
      const country = addr.country || 'Nigeria';

      const parts = [road, suburb, town, state, country].filter(Boolean);
      const fullAddress = parts.length > 0 ? parts.join(', ') : nom.display_name;
      const ogere = resolveOgereLocation(lat, lng);

      return {
        fullAddress,
        nearestLandmark: ogere.landmark,
        sector: ogere.sector,
        ...maps,
      };
    }
  } catch (_) {}

  // 3. Local landmark fallback
  const ogere = resolveOgereLocation(lat, lng);
  return {
    fullAddress: `${ogere.landmark}, Ogere Remo, Ogun State, Nigeria`,
    nearestLandmark: ogere.landmark,
    sector: ogere.sector,
    ...maps,
  };
}

/**
 * Real-Time Forward Address Search for Mobile
 */
export async function searchAddressMobile(query: string): Promise<GeocodedPlace[]> {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  // 1. Try server geocode endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (_) {}

  // 2. Local Ogere landmarks match
  const results: GeocodedPlace[] = [];
  const qLower = q.toLowerCase();

  for (const lm of OGERE_LANDMARKS) {
    if (lm.name.toLowerCase().includes(qLower) || lm.sector.toLowerCase().includes(qLower)) {
      results.push({
        id: `local-${lm.id}`,
        name: lm.name,
        address: `${lm.name}, ${lm.sector}, Ogere Remo`,
        sector: lm.sector,
        latitude: lm.lat,
        longitude: lm.lng,
        isLocal: true,
        ...getStandardMapUrls(lm.lat, lm.lng),
      });
    }
  }

  // 3. Nominatim Fallback
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=ng&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'OgereRemoMobile/2.1',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    if (nomRes.ok) {
      const items = await nomRes.json();
      for (const item of items) {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        results.push({
          id: `nom-${item.place_id}`,
          name: item.name || item.display_name.split(',')[0],
          address: item.display_name,
          sector: 'Regional Match',
          latitude: lat,
          longitude: lng,
          isLocal: false,
          ...getStandardMapUrls(lat, lng),
        });
      }
    }
  } catch (_) {}

  return results;
}

/**
 * Open Turn-by-Turn Navigation directly to coordinates
 */
export function openTurnByTurnDirections(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Directions', `Navigate to coordinates: ${lat}, ${lng}\nURL: ${url}`);
  });
}
