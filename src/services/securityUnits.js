// src/services/securityUnits.js
// Catalog of Security Stations & Units in Ogere Remo with Onboarded Personnel

export const OGERE_STATIONS = [
  {
    id: 'station-npf-div',
    name: 'Ogere Divisional Police HQ',
    code: 'NPF-DIV-01',
    agency: 'Nigeria Police Force',
    category: 'POLICE',
    address: 'KM 67 Lagos-Ibadan Expressway, Ogere Tollgate Junction',
    coordinates: { lat: 6.9412, lng: 3.6485 },
    phone: '+234 803 123 4567',
    radioFreq: '144.825 MHz (Tactical 1)',
    readiness: 'HIGH',
    jurisdiction: ['Expressway Corridor', 'Ogere Tollgate', 'Industrial Zone', 'Central Ogere'],
    activeUnitsCount: 4,
    color: '#3b82f6'
  },
  {
    id: 'station-palace-guard',
    name: 'Aafin Ologere Royal Security Command',
    code: 'PALACE-SEC-01',
    agency: 'Palace Security & Town Marshals',
    category: 'COMMUNITY',
    address: 'Ologere Palace Compound, Central Town Square',
    coordinates: { lat: 6.9388, lng: 3.6437 },
    phone: '+234 802 987 6543',
    radioFreq: '144.900 MHz (Town Net)',
    readiness: 'HIGH',
    jurisdiction: ['Town Square', 'Oja Oba Market', 'Yemogun St', 'Palace Environs'],
    activeUnitsCount: 3,
    color: '#eab308'
  },
  {
    id: 'station-sosafe-outpost',
    name: 'So-Safe Corps Area Sector Command',
    code: 'SOSAFE-SEC-02',
    agency: 'Ogun State So-Safe Corps',
    category: 'VIGILANTE',
    address: 'Isale-Ogere Inner Junction, Old Road',
    coordinates: { lat: 6.9320, lng: 3.6380 },
    phone: '+234 805 444 3322',
    radioFreq: '145.100 MHz (Sector 2)',
    readiness: 'HIGH',
    jurisdiction: ['Isale Ogere', 'Ago-Iwoye Link Road', 'Residential Quarters'],
    activeUnitsCount: 3,
    color: '#10b981'
  },
  {
    id: 'station-frsc-base',
    name: 'FRSC Ogere Outpost Command',
    code: 'FRSC-OG-01',
    agency: 'Federal Road Safety Corps',
    category: 'TRAFFIC',
    address: 'Ogere Trailer Park & Weighbridge Station',
    coordinates: { lat: 6.9460, lng: 3.6520 },
    phone: '+234 807 555 7788',
    radioFreq: '145.350 MHz (Corridor Rescue)',
    readiness: 'HIGH',
    jurisdiction: ['Expressway Bypass', 'Trailer Park', 'Interchange Overpass'],
    activeUnitsCount: 2,
    color: '#f97316'
  },
  {
    id: 'station-amotekun-post',
    name: 'Amotekun & Hunters Defense Outpost',
    code: 'AMOTEKUN-03',
    agency: 'Amotekun Corps / Local Hunters Guild',
    category: 'VIGILANTE',
    address: 'Agbele Farmlands & Forest Border Post',
    coordinates: { lat: 6.9250, lng: 3.6300 },
    phone: '+234 818 222 9900',
    radioFreq: '144.750 MHz (Perimeter Net)',
    readiness: 'HIGH',
    jurisdiction: ['Agbele Perimeter', 'Farm Settlements', 'Forest Link Borders'],
    activeUnitsCount: 2,
    color: '#a855f7'
  }
];

export const ONBOARDED_OFFICERS = [
  {
    id: 'off-001',
    name: 'Insp. Babatunde Alabi',
    badge: 'NPF-8842',
    rank: 'Inspector / Sector Commander',
    agency: 'Nigeria Police Force',
    stationId: 'station-npf-div',
    unitName: 'Patrol Team Alpha (Car 04)',
    status: 'ONLINE_ACTIVE', // ONLINE_ACTIVE, ON_DISPATCH, OFF_DUTY
    callsign: 'EAGLE-1',
    phone: '+234 803 123 4567',
    avatar: '👮‍♂️',
    location: { lat: 6.9415, lng: 3.6478, landmark: 'Ogere Tollgate Flyover' },
    battery: 92,
    speedKmH: 24,
    lastSeen: 'Just now'
  },
  {
    id: 'off-002',
    name: 'Officer Adekunle Ojo',
    badge: 'NPF-9104',
    rank: 'Sergeant',
    agency: 'Nigeria Police Force',
    stationId: 'station-npf-div',
    unitName: 'Expressway Rapid Intercept',
    status: 'ONLINE_ACTIVE',
    callsign: 'EAGLE-2',
    phone: '+234 803 999 1122',
    avatar: '👮‍♂️',
    location: { lat: 6.9440, lng: 3.6500, landmark: 'Trailer Park Bypass' },
    battery: 78,
    speedKmH: 35,
    lastSeen: '1 min ago'
  },
  {
    id: 'off-003',
    name: 'Chief Hunter Rasheed Adeleke',
    badge: 'PAL-007',
    rank: 'High Chief Marshal',
    agency: 'Palace Security & Town Marshals',
    stationId: 'station-palace-guard',
    unitName: 'Palace Royal Escort Squad',
    status: 'ONLINE_ACTIVE',
    callsign: 'OLOGERE-LEAD',
    phone: '+234 802 987 6543',
    avatar: '🛡️',
    location: { lat: 6.9388, lng: 3.6437, landmark: 'Aafin Ologere Gate' },
    battery: 88,
    speedKmH: 0,
    lastSeen: 'Just now'
  },
  {
    id: 'off-004',
    name: 'Commander Yemi Solaja',
    badge: 'SOS-302',
    rank: 'Area Sector Commander',
    agency: 'Ogun State So-Safe Corps',
    stationId: 'station-sosafe-outpost',
    unitName: 'So-Safe Quick Response Unit',
    status: 'ONLINE_ACTIVE',
    callsign: 'PANTHER-1',
    phone: '+234 805 444 3322',
    avatar: '🚨',
    location: { lat: 6.9335, lng: 3.6390, landmark: 'Isale Ogere Market Junction' },
    battery: 81,
    speedKmH: 12,
    lastSeen: 'Just now'
  },
  {
    id: 'off-005',
    name: 'DRC Chinedu Okafor',
    badge: 'FRSC-771',
    rank: 'Deputy Route Commander',
    agency: 'Federal Road Safety Corps',
    stationId: 'station-frsc-base',
    unitName: 'Rescue Ambulance Unit 1',
    status: 'ONLINE_ACTIVE',
    callsign: 'MEDIC-CORRIDOR',
    phone: '+234 807 555 7788',
    avatar: '🚑',
    location: { lat: 6.9465, lng: 3.6515, landmark: 'Ogere Weighbridge' },
    battery: 95,
    speedKmH: 0,
    lastSeen: '3 mins ago'
  },
  {
    id: 'off-006',
    name: 'Agbaode Gbadamosi',
    badge: 'AMT-109',
    rank: 'Field Operative',
    agency: 'Amotekun Corps / Local Hunters Guild',
    stationId: 'station-amotekun-post',
    unitName: 'Bush & Border Patrol Unit',
    status: 'ONLINE_ACTIVE',
    callsign: 'HUNTER-3',
    phone: '+234 818 222 9900',
    avatar: '🏹',
    location: { lat: 6.9260, lng: 3.6315, landmark: 'Agbele Outskirts Path' },
    battery: 65,
    speedKmH: 5,
    lastSeen: 'Just now'
  }
];

export function getStationById(stationId) {
  return OGERE_STATIONS.find(s => s.id === stationId) || OGERE_STATIONS[0];
}

export function getOfficerById(officerId) {
  return ONBOARDED_OFFICERS.find(o => o.id === officerId) || ONBOARDED_OFFICERS[0];
}

export function getStationForOfficer(officerId) {
  const officer = getOfficerById(officerId);
  return getStationById(officer.stationId);
}
