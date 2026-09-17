/**
 * ogereGeoEngine.js
 * Ogere Remo Hyper-Local Geocoding & High-Precision Location Engine
 * 
 * Provides street-level landmark resolution, distance calculation, compass bearings,
 * and high-accuracy satellite map URLs specifically tuned for Ogere Remo, Ogun State.
 */

// Bounding Box for Ogere Remo Urban & Expressway Corridor
export const OGERE_BOUNDS = {
  minLat: 6.9050,
  maxLat: 6.9750,
  minLng: 3.6050,
  maxLng: 3.6750,
};

// Ogere Remo High-Precision Landmark Registry
export const OGERE_LANDMARKS = [
  {
    id: 'tollgate',
    name: 'Ogere Toll Gate / Expressway Intercept',
    sector: 'Sector 1 — Highway Corridor',
    lat: 6.9388,
    lng: 3.6437,
    type: 'transit',
    note: 'KM 67 Lagos-Ibadan Expressway · Major Emergency Rendezvous Point',
  },
  {
    id: 'old_tollgate',
    name: 'Ogere Tollgate Bypass / Old Tollgate',
    sector: 'Sector 1 — Highway Corridor',
    lat: 6.9380,
    lng: 3.6410,
    type: 'transit',
    note: 'Old Tollgate Access, Heavy Duty Vehicle Bypass',
  },
  {
    id: 'palace',
    name: 'Aafin Ologere Palace & Royal Square',
    sector: 'Sector 2 — Central Heritage Core',
    lat: 6.9368,
    lng: 3.6330,
    type: 'royal',
    note: 'Palace Way · Seat of HRM Oba Ogere Remo & Royal Taskforce HQ',
  },
  {
    id: 'central_market',
    name: 'Ogere Central Market (Oja Ogere)',
    sector: 'Sector 2 — Central Heritage Core',
    lat: 6.9354,
    lng: 3.6338,
    type: 'commerce',
    note: 'Oke-Ogere Commercial Axis & Traditional Market Square',
  },
  {
    id: 'police_station',
    name: 'Ogere Police Divisional Station',
    sector: 'Sector 3 — Security & Emergency',
    lat: 6.9348,
    lng: 3.6356,
    type: 'security',
    note: 'Nigeria Police Force Ogere Division HQ (DPO Command)',
  },
  {
    id: 'hospital',
    name: 'Ogere State Hospital & Health Centre',
    sector: 'Sector 4 — Medical & Social',
    lat: 6.9325,
    lng: 3.6310,
    type: 'medical',
    note: 'Isale-Ogere Hospital Road · 24/7 Emergency Medical Ward',
  },
  {
    id: 'trailer_park',
    name: 'Ogere Trailer Park & Logistics Hub',
    sector: 'Sector 1 — Highway Corridor',
    lat: 6.9366,
    lng: 3.6344,
    type: 'transit',
    note: 'Interstate Cargo & Logistics Terminal',
  },
  {
    id: 'ositelu_college',
    name: 'Ositelu Memorial College',
    sector: 'Sector 5 — Academic Belt',
    lat: 6.9405,
    lng: 3.6397,
    type: 'education',
    note: 'Awomosu Agbato Drive · Flagship Secondary School',
  },
  {
    id: 'aladura_hq',
    name: 'Church of the Lord (Aladura) Mount Taborar',
    sector: 'Sector 2 — Central Heritage Core',
    lat: 6.9360,
    lng: 3.6420,
    type: 'heritage',
    note: 'World Heritage Spiritual Centre (Founded 1930)',
  },
  {
    id: 'town_hall',
    name: 'Ogere Town Hall (OCDA HQ)',
    sector: 'Sector 2 — Central Heritage Core',
    lat: 6.9363,
    lng: 3.6318,
    type: 'civic',
    note: 'Ogere Community Development Association Civic Centre',
  },
  {
    id: 'agbele',
    name: 'Agbele Ancestral Axis',
    sector: 'Sector 6 — Western Residential',
    lat: 6.9290,
    lng: 3.6260,
    type: 'residential',
    note: 'Agbele / Odo-Alaro boundary corridor',
  },
  {
    id: 'saapade_jct',
    name: 'Saapade Junction / Remo North Corridor',
    sector: 'Sector 7 — Northern Gateway',
    lat: 6.9550,
    lng: 3.6480,
    type: 'transit',
    note: 'Northern arterial access toward Ibadan & Remo North',
  },
  {
    id: 'resort',
    name: 'Ogere Resort & Convention Centre',
    sector: 'Sector 1 — Highway Corridor',
    lat: 6.9388,
    lng: 3.6437,
    type: 'hospitality',
    note: 'KM 67 Lagos-Ibadan Expressway',
  },
];

/**
 * Calculate distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculate compass bearing from point 1 to point 2 (e.g. 'NE', 'SW')
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const bearings = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(brng / 22.5) % 16;
  return bearings[index];
}

/**
 * Check if coordinates are inside Ogere Remo geographic boundary
 */
export function isInsideOgere(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return (
    lat >= OGERE_BOUNDS.minLat &&
    lat <= OGERE_BOUNDS.maxLat &&
    lng >= OGERE_BOUNDS.minLng &&
    lng <= OGERE_BOUNDS.maxLng
  );
}

/**
 * Resolve hyper-local Ogere landmark and street context from coordinates
 */
export function resolveOgereLocation(lat, lng, accuracy = null) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return {
      isOgere: false,
      landmark: 'Unknown Location',
      sector: 'General Sector',
      formattedText: 'Location coordinates unavailable',
      distanceToPolice: null,
      policeEtaMinutes: null,
      nearestLandmarkDistance: null,
    };
  }

  const insideOgere = isInsideOgere(lat, lng);

  // Find closest landmark
  let closest = OGERE_LANDMARKS[0];
  let minDistance = Infinity;

  for (const lm of OGERE_LANDMARKS) {
    const dist = calculateDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = lm;
    }
  }

  // Calculate distance & ETA from Ogere Police Station
  const police = OGERE_LANDMARKS.find((l) => l.id === 'police_station') || OGERE_LANDMARKS[0];
  const distanceToPolice = calculateDistanceMeters(lat, lng, police.lat, police.lng);
  // Assume tactical patrol car speed 40 km/h in town (~667 meters/minute)
  const policeEtaMinutes = Math.max(1, Math.round(distanceToPolice / 650));

  const bearing = calculateBearing(closest.lat, closest.lng, lat, lng);

  let formattedText = '';
  if (minDistance <= 45) {
    formattedText = `Directly at ${closest.name}, Ogere Remo`;
  } else if (minDistance <= 300) {
    formattedText = `~${minDistance}m ${bearing} of ${closest.name}, Ogere Remo`;
  } else if (minDistance <= 1500) {
    formattedText = `~${(minDistance / 1000).toFixed(1)}km from ${closest.name} (${closest.sector})`;
  } else {
    formattedText = insideOgere
      ? `${(minDistance / 1000).toFixed(1)}km ${bearing} of ${closest.name} (Ogere Remo)`
      : `⚠️ ${Math.round(minDistance / 1000)}km outside Ogere Remo (${closest.name} corridor)`;
  }

  return {
    isOgere: insideOgere,
    landmark: closest.name,
    sector: closest.sector,
    landmarkType: closest.type,
    nearestLandmarkDistance: minDistance,
    bearingFromLandmark: bearing,
    formattedText,
    distanceToPolice,
    policeEtaMinutes,
    accuracyRating:
      accuracy === null
        ? 'unknown'
        : accuracy <= 8
        ? 'pinpoint_satellite' // ±1m - ±8m: Military/High-end GPS
        : accuracy <= 25
        ? 'good_gps'           // ±9m - ±25m: Standard GPS
        : accuracy <= 100
        ? 'moderate_gps'       // ±26m - ±100m: Degraded GPS
        : 'coarse_cell_ip',    // > 100m: Cell Tower / IP
  };
}

/**
 * Generate Google Maps URLs with high-precision satellite & street zooms
 */
export function getOgereMapUrls(lat, lng, label = 'Emergency Distress Target') {
  const safeLat = Number(lat || 6.9388).toFixed(6);
  const safeLng = Number(lng || 3.6437).toFixed(6);

  return {
    // Rooftop Satellite Hybrid Pin (Zoom 19 with satellite imagery and street names)
    satellitePin: `https://www.google.com/maps?q=${safeLat},${safeLng}+(${encodeURIComponent(label)})&ll=${safeLat},${safeLng}&z=19&t=k`,
    // Standard Street Map Pin
    streetPin: `https://www.google.com/maps?q=loc:${safeLat},${safeLng}&z=18&t=m`,
    // Turn-by-turn Tactical Driving Navigation
    turnByTurnNavigation: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}&travelmode=driving`,
    // High-Resolution Embed for Web / Iframes (Zoom 18 Hybrid Satellite)
    embedHybrid: `https://maps.google.com/maps?q=${safeLat},${safeLng}&t=k&z=18&output=embed`,
    // Standard Embed for Web / Iframes (Zoom 17 Roadmap)
    embedRoadmap: `https://maps.google.com/maps?q=${safeLat},${safeLng}&t=m&z=17&output=embed`,
  };
}
