/**
 * api/geocode.js
 * Real-Time Geocoding & High-Precision Location Resolver for Ogere Remo
 * 
 * Supports:
 * - Reverse Geocoding: Coordinates (lat, lng) -> Exact Street Address + Ogere Landmark/Sector + Google Maps URLs
 * - Forward Geocoding: Address/Place Query -> Coordinates + Google Maps Pinpoint
 */

const OGERE_LANDMARKS = [
  { name: 'Aafin Ologere Palace & Royal Square', sector: 'Sector 2 — Central Heritage Core', lat: 6.9368, lng: 3.6330, address: 'Palace Way, Oke-Ogere' },
  { name: 'Ogere Toll Gate / Expressway Intercept', sector: 'Sector 1 — Highway Corridor', lat: 6.9388, lng: 3.6437, address: 'KM 67 Lagos-Ibadan Expressway' },
  { name: 'Ogere Resort & Convention Centre', sector: 'Sector 1 — Highway Corridor', lat: 6.9388, lng: 3.6437, address: 'KM 67 Lagos-Ibadan Expressway' },
  { name: 'Ogere Central Market (Oja Ogere)', sector: 'Sector 2 — Central Heritage Core', lat: 6.9354, lng: 3.6338, address: 'Market Road, Oke-Ogere' },
  { name: 'Ogere Police Divisional Station', sector: 'Sector 3 — Security & Emergency', lat: 6.9348, lng: 3.6356, address: 'Palace Way, Ogere Remo' },
  { name: 'Ogere State Hospital & Health Centre', sector: 'Sector 4 — Medical & Social', lat: 6.9325, lng: 3.6310, address: 'Isale-Ogere Hospital Road' },
  { name: 'Ogere Trailer Park & Logistics Hub', sector: 'Sector 1 — Highway Corridor', lat: 6.9366, lng: 3.6344, address: 'Expressway Bypass South' },
  { name: 'Ositelu Memorial College', sector: 'Sector 5 — Academic Belt', lat: 6.9405, lng: 3.6397, address: 'Awomosu Agbato Drive' },
  { name: 'The Church of the Lord (Aladura) Worldwide HQ', sector: 'Sector 2 — Central Heritage Core', lat: 6.9360, lng: 3.6420, address: 'Mount Taborar, Lisa Quarter' },
  { name: 'Ogere Town Hall & Civic Centre (OCDA HQ)', sector: 'Sector 2 — Central Heritage Core', lat: 6.9363, lng: 3.6318, address: 'Town Centre, Ogere Remo' },
  { name: 'Agbele Ancestral Corridor', sector: 'Sector 6 — Western Residential', lat: 6.9290, lng: 3.6260, address: 'Agbele / Odo-Alaro Road' },
  { name: 'Saapade Junction / Remo North Axis', sector: 'Sector 7 — Northern Gateway', lat: 6.9550, lng: 3.6480, address: 'Ibadan-Remo Arterial Junction' },
  { name: 'Hephzibah Edutech & Innovation Campus', sector: 'Sector 2 — Central Heritage Core', lat: 6.9378, lng: 3.6360, address: 'Palace Way / Expressway Corridor' },
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getGoogleMapsUrls(lat, lng, label = 'Location Pinpoint') {
  const safeLat = Number(lat).toFixed(6);
  const safeLng = Number(lng).toFixed(6);

  return {
    // Official Google Maps Search Pinpoint (guaranteed coordinate drop on mobile & desktop)
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`,
    // Satellite View (Zoom 19)
    satelliteMapsUrl: `https://www.google.com/maps?q=${safeLat},${safeLng}&ll=${safeLat},${safeLng}&z=19&t=k`,
    // Turn-by-Turn Driving Navigation
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}&travelmode=driving`,
    // Embed iframe url
    embedUrl: `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=17&ie=UTF8&output=embed`,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryParams = req.query || {};
  const body = req.body || {};

  const query = queryParams.q || queryParams.query || body.q || body.query;
  const latParam = queryParams.lat || queryParams.latitude || body.lat || body.latitude;
  const lngParam = queryParams.lng || queryParams.longitude || body.lng || body.longitude;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. REVERSE GEOCODING: Coordinates (lat, lng) -> Real Street Address
  // ─────────────────────────────────────────────────────────────────────────────
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid latitude or longitude coordinates.' });
    }

    // Find nearest landmark in Ogere Remo
    let closestLandmark = OGERE_LANDMARKS[0];
    let minDistance = Infinity;
    for (const lm of OGERE_LANDMARKS) {
      const dist = calculateDistance(lat, lng, lm.lat, lm.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestLandmark = lm;
      }
    }

    const isInsideOgere = lat >= 6.905 && lat <= 6.975 && lng >= 3.605 && lng <= 3.675;

    // Fetch live address from OpenStreetMap Nominatim
    let liveAddress = null;
    let rawNominatim = null;

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 4500);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'OgereRemoCivicPortal/2.1 (contact@ogeremo.org)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: ctrl.signal,
        }
      );
      clearTimeout(tid);

      if (nomRes.ok) {
        rawNominatim = await nomRes.json();
        const addr = rawNominatim.address || {};
        const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
        const suburb = addr.suburb || addr.quarter || addr.village || addr.city_district || '';
        const town = addr.town || addr.city || addr.county || 'Ogere Remo';
        const state = addr.state || 'Ogun State';
        const country = addr.country || 'Nigeria';

        const parts = [road, suburb, town, state, country].filter(Boolean);
        if (parts.length > 0) {
          liveAddress = parts.join(', ');
        }
      }
    } catch (_) {
      // Offline or network timeout - fallback to local landmark
    }

    const formattedLandmark = minDistance <= 50
      ? `Directly at ${closestLandmark.name}`
      : minDistance <= 500
      ? `~${minDistance}m from ${closestLandmark.name} (${closestLandmark.sector})`
      : isInsideOgere
      ? `~${(minDistance / 1000).toFixed(1)}km from ${closestLandmark.name} (Ogere Remo)`
      : `~${Math.round(minDistance / 1000)}km outside Ogere Remo`;

    const finalAddress = liveAddress || `${closestLandmark.address}, Ogere Remo, Ogun State, Nigeria`;
    const maps = getGoogleMapsUrls(lat, lng, closestLandmark.name);

    return res.status(200).json({
      success: true,
      latitude: lat,
      longitude: lng,
      address: finalAddress,
      rawAddress: rawNominatim?.address || null,
      isInsideOgere,
      nearestLandmark: closestLandmark.name,
      landmarkSector: closestLandmark.sector,
      distanceToLandmarkMeters: minDistance,
      landmarkFormatted: formattedLandmark,
      ...maps,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FORWARD GEOCODING: Address Search -> Coordinates & Google Maps
  // ─────────────────────────────────────────────────────────────────────────────
  if (query && query.trim()) {
    const qLower = query.trim().toLowerCase();
    const results = [];

    // Check local Ogere landmarks first
    for (const lm of OGERE_LANDMARKS) {
      if (
        lm.name.toLowerCase().includes(qLower) ||
        lm.address.toLowerCase().includes(qLower) ||
        lm.sector.toLowerCase().includes(qLower)
      ) {
        results.push({
          id: `local-${lm.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: lm.name,
          address: `${lm.address}, Ogere Remo, Ogun State`,
          sector: lm.sector,
          latitude: lm.lat,
          longitude: lm.lng,
          isLocal: true,
          ...getGoogleMapsUrls(lm.lat, lm.lng, lm.name),
        });
      }
    }

    // Query Nominatim for global/regional real-time matches
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 4500);

      // Search with Nigeria priority
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=ng&limit=5&addressdetails=1`;
      const nomRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'OgereRemoCivicPortal/2.1 (contact@ogeremo.org)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (nomRes.ok) {
        const data = await nomRes.json();
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          results.push({
            id: `nom-${item.place_id}`,
            name: item.name || item.display_name.split(',')[0],
            address: item.display_name,
            sector: 'External Coordinate Point',
            latitude: lat,
            longitude: lng,
            isLocal: false,
            ...getGoogleMapsUrls(lat, lng, item.name || query),
          });
        }
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      query,
      count: results.length,
      results,
    });
  }

  return res.status(400).json({
    success: false,
    error: 'Provide either "q" (for address search) or "lat" and "lng" (for reverse geocoding).',
  });
}
