/**
 * liveLocationEngine.js
 * High-Precision GPS Acquisition, Real-Time Reverse/Forward Geocoding, and Google Maps Navigation Engine
 * 
 * Solves:
 * 1. Why Google Maps wasn't getting exact location:
 *    - Short timeouts (5.5s) expiring before satellite lock indoors.
 *    - Premature fallback to Ogere center coordinates.
 *    - Non-standard Google Maps query strings that triggered text search instead of coordinate pin drop.
 * 2. Real-time address reverse-geocoding (Lat/Lng -> Real Street Address & Ogere Landmark/Sector).
 * 3. Real-time forward address lookup / autocomplete with instant Google Maps synchronization.
 * 4. Automatic turn-by-turn driving directions to venue.
 */

import { OGERE_LANDMARKS, resolveOgereLocation } from './ogereGeoEngine';

/**
 * Standard Universal Google Maps URLs (Guaranteed exact pin drop without text-search interference)
 */
export function getStandardMapUrls(lat, lng, label = 'Emergency Location') {
  const safeLat = Number(lat || 6.9388).toFixed(6);
  const safeLng = Number(lng || 3.6437).toFixed(6);

  return {
    // Official Google Maps Search Pinpoint (Exact Coordinate Drop on Android, iOS, Desktop)
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`,
    // Satellite Hybrid View with High Zoom (19)
    satelliteMapsUrl: `https://www.google.com/maps?q=${safeLat},${safeLng}&ll=${safeLat},${safeLng}&z=19&t=k`,
    // Turn-by-Turn Driving Navigation directly to the venue / doorstep
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}&travelmode=driving`,
    // Embed iframe url
    embedUrl: `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=17&ie=UTF8&output=embed`,
  };
}

/**
 * Acquire High-Precision GPS with progressive satellite refinement
 * Does NOT prematurely timeout in 5s. Listens for up to 12s to continuously tighten accuracy radius.
 */
export async function acquirePreciseGpsLocation(options = {}) {
  const {
    timeoutMs = 12000,
    targetAccuracyMeters = 15,
    onProgress = null,
  } = options;

  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      latitude: 6.9388,
      longitude: 3.6437,
      accuracy: null,
      source: 'unsupported',
      isGpsPrecise: false,
      error: 'Geolocation API not supported in this browser.',
      ...getStandardMapUrls(6.9388, 3.6437),
    };
  }

  return new Promise((resolve) => {
    let bestFix = null;
    let isFinished = false;
    let watchId = null;

    const cleanup = () => {
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (_) {}
      }
    };

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      cleanup();

      if (bestFix) {
        resolve({
          latitude: bestFix.lat,
          longitude: bestFix.lng,
          accuracy: bestFix.accuracy,
          altitude: bestFix.altitude,
          heading: bestFix.heading,
          speed: bestFix.speed,
          source: 'hardware_gps',
          isGpsPrecise: (bestFix.accuracy || 999) <= 30,
          timestamp: new Date().toISOString(),
          ...getStandardMapUrls(bestFix.lat, bestFix.lng),
        });
      } else {
        // Fallback: Attempt single one-shot query before giving up
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
            resolve({
              latitude: lat,
              longitude: lng,
              accuracy: acc,
              source: 'hardware_gps_oneshot',
              isGpsPrecise: (acc || 999) <= 50,
              timestamp: new Date().toISOString(),
              ...getStandardMapUrls(lat, lng),
            });
          },
          (err) => {
            console.warn('[LiveLocationEngine] GPS acquisition error:', err.message);
            resolve({
              latitude: 6.9388,
              longitude: 3.6437,
              accuracy: 250,
              source: 'default_fallback',
              isGpsPrecise: false,
              error: err.code === 1 ? 'Location permission was denied by user.' : 'Satellite lock timed out.',
              ...getStandardMapUrls(6.9388, 3.6437),
            });
          },
          { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
        );
      }
    };

    const timer = setTimeout(finish, timeoutMs);

    const onFix = (pos) => {
      const fix = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
        altitude: pos.coords.altitude || null,
        heading: pos.coords.heading || null,
        speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null,
      };

      const curAcc = fix.accuracy || 9999;
      const bestAcc = bestFix ? (bestFix.accuracy || 9999) : 9999;

      if (!bestFix || curAcc < bestAcc) {
        bestFix = fix;
        if (typeof onProgress === 'function') {
          onProgress(fix);
        }
      }

      // Early resolution on pristine satellite lock
      if (curAcc <= targetAccuracyMeters) {
        clearTimeout(timer);
        finish();
      }
    };

    const onError = (err) => {
      console.warn('[LiveLocationEngine] watchPosition warning:', err.message);
      // Wait for timeout or one-shot fallback
    };

    try {
      watchId = navigator.geolocation.watchPosition(onFix, onError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs,
      });
    } catch (_) {
      finish();
    }
  });
}

/**
 * Real-Time Reverse Geocoding: Coordinates -> Exact Full Street Address & Sector
 */
export async function reverseGeocodeLocation(lat, lng) {
  const safeLat = parseFloat(lat);
  const safeLng = parseFloat(lng);

  if (isNaN(safeLat) || isNaN(safeLng)) {
    return {
      fullAddress: 'Unknown Location',
      nearestLandmark: 'Ogere Remo',
      sector: 'General Sector',
      ...getStandardMapUrls(6.9388, 3.6437),
    };
  }

  // 1. Try local endpoint first
  try {
    const res = await fetch(`/api/geocode?lat=${safeLat}&lng=${safeLng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          fullAddress: data.address,
          nearestLandmark: data.nearestLandmark,
          sector: data.landmarkSector,
          distanceToLandmarkMeters: data.distanceToLandmarkMeters,
          landmarkFormatted: data.landmarkFormatted,
          googleMapsUrl: data.googleMapsUrl,
          satelliteMapsUrl: data.satelliteMapsUrl,
          directionsUrl: data.directionsUrl,
          embedUrl: data.embedUrl,
        };
      }
    }
  } catch (_) {}

  // 2. Client-side OpenStreetMap Nominatim Fallback
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${safeLat}&lon=${safeLng}&zoom=18&addressdetails=1`
    );
    if (nomRes.ok) {
      const nom = await nomRes.json();
      const addr = nom.address || {};
      const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
      const suburb = addr.suburb || addr.quarter || addr.village || '';
      const town = addr.town || addr.city || 'Ogere Remo';
      const state = addr.state || 'Ogun State';
      const country = addr.country || 'Nigeria';

      const parts = [road, suburb, town, state, country].filter(Boolean);
      const fullAddress = parts.length > 0 ? parts.join(', ') : nom.display_name;

      const ogere = resolveOgereLocation(safeLat, safeLng);
      return {
        fullAddress,
        nearestLandmark: ogere.landmark,
        sector: ogere.sector,
        distanceToLandmarkMeters: ogere.nearestLandmarkDistance,
        landmarkFormatted: ogere.formattedText,
        ...getStandardMapUrls(safeLat, safeLng, ogere.landmark),
      };
    }
  } catch (_) {}

  // 3. Mathematical Landmark Resolution Fallback
  const ogere = resolveOgereLocation(safeLat, safeLng);
  return {
    fullAddress: `${ogere.landmark}, Ogere Remo, Ogun State, Nigeria`,
    nearestLandmark: ogere.landmark,
    sector: ogere.sector,
    distanceToLandmarkMeters: ogere.nearestLandmarkDistance,
    landmarkFormatted: ogere.formattedText,
    ...getStandardMapUrls(safeLat, safeLng, ogere.landmark),
  };
}

/**
 * Real-Time Forward Geocoding: Address Search Query -> List of Matching Places & Coordinates
 */
export async function searchAddressInRealtime(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  // 1. Try local server route first
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (_) {}

  // 2. Client-side Nominatim + Ogere Landmark filter fallback
  const results = [];
  const qLower = q.toLowerCase();

  for (const lm of OGERE_LANDMARKS) {
    if (lm.name.toLowerCase().includes(qLower) || lm.sector.toLowerCase().includes(qLower)) {
      results.push({
        id: `local-${lm.id}`,
        name: lm.name,
        address: `${lm.name}, ${lm.sector}, Ogere Remo, Ogun State`,
        sector: lm.sector,
        latitude: lm.lat,
        longitude: lm.lng,
        isLocal: true,
        ...getStandardMapUrls(lm.lat, lm.lng, lm.name),
      });
    }
  }

  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=ng&limit=5&addressdetails=1`
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
          sector: 'External Location',
          latitude: lat,
          longitude: lng,
          isLocal: false,
          ...getStandardMapUrls(lat, lng, item.name || q),
        });
      }
    }
  } catch (_) {}

  return results;
}
