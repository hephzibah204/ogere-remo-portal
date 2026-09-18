// src/services/fixMyStreetService.js
// Civic Infrastructure, Public Works & IBEDC Power Grid Monitor for Ogere Remo

export const ISSUE_CATEGORIES = [
  { id: 'pothole_road', label: 'Road Damage & Potholes', icon: '🚧', color: '#f59e0b' },
  { id: 'power_transformer', label: 'IBEDC Transformer / Blackout', icon: '⚡', color: '#eab308' },
  { id: 'drainage_flooding', label: 'Clogged Drainage & Flooding', icon: '🌊', color: '#38bdf8' },
  { id: 'streetlight_fault', label: 'Solar Streetlight Malfunction', icon: '💡', color: '#a855f7' },
  { id: 'water_pipe_leak', label: 'Public Borehole / Pipe Burst', icon: '🚰', color: '#06b6d4' },
  { id: 'waste_dump', label: 'Illegal Waste Dump & Sanitation', icon: '🗑️', color: '#ef4444' },
];

export const OGERE_QUARTERS = [
  { id: 'oke_ogere', name: 'Oke-Ogere Quarter', powerStatus: 'ON', lastPowerChange: '3 hrs ago', transformer: 'Central Palace 500kVA', loadRating: '84%' },
  { id: 'isale_ogere', name: 'Isale-Ogere Quarter', powerStatus: 'ON', lastPowerChange: '5 hrs ago', transformer: 'Hospital Road 300kVA', loadRating: '76%' },
  { id: 'ijana', name: 'Ijana Quarter', powerStatus: 'OFF', lastPowerChange: '45 mins ago', transformer: 'Ijana Link 500kVA', loadRating: '0% (Tripped)' },
  { id: 'agbele', name: 'Agbele Ancestral Corridor', powerStatus: 'ON', lastPowerChange: '1 hr ago', transformer: 'Agbele Substation 300kVA', loadRating: '62%' },
  { id: 'expressway_toll', name: 'Expressway & Tollgate Hub', powerStatus: 'ON', lastPowerChange: '8 hrs ago', transformer: 'Industrial Feeder 1MVA', loadRating: '91%' },
];

const SEED_ISSUES = [
  {
    id: 'FMS-2026-104',
    title: 'Severe Asphalt Potholes on Palace Way near Town Hall',
    category: 'pothole_road',
    quarter: 'Oke-Ogere',
    location: 'Palace Way, directly opposite OCDA Secretariat',
    latitude: 6.9368,
    longitude: 3.6330,
    severity: 'HIGH',
    status: 'CONTRACTOR_ASSIGNED', // REPORTED, INVESTIGATING, CONTRACTOR_ASSIGNED, IN_PROGRESS, RESOLVED
    upvotes: 28,
    reporterName: 'Segun Ogunsanya',
    description: 'Deep pothole damaging low vehicle suspensions and slowing emergency ambulances from Tollgate.',
    assignedContractor: 'Remo North Works Dept & OCDA Paving Unit',
    contractorEta: 'Paving team mobilized for Friday 26th Sep',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    photoUrl: null,
  },
  {
    id: 'FMS-2026-098',
    title: 'Transformer Fuse Surge near Ijana Junction',
    category: 'power_transformer',
    quarter: 'Ijana',
    location: 'Ijana Market Link, adjacent to Aladura Primary School',
    latitude: 6.9354,
    longitude: 3.6338,
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    upvotes: 45,
    reporterName: 'Engr. Dapo Alabi',
    description: 'High voltage spark caused feeder trip during evening thunderstorm. Entire Ijana residential axis offline.',
    assignedContractor: 'IBEDC Sagamu Technical Unit',
    contractorEta: 'Engineers on site replacing feeder dropouts',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    photoUrl: null,
  },
  {
    id: 'FMS-2026-092',
    title: 'Clogged Concrete Gutter Causing Market Stagnation',
    category: 'drainage_flooding',
    quarter: 'Isale-Ogere',
    location: 'Isale Hospital Road Drain',
    latitude: 6.9325,
    longitude: 3.6310,
    severity: 'MEDIUM',
    status: 'RESOLVED',
    upvotes: 19,
    reporterName: 'Mrs. Funke Solarin',
    description: 'Sand silt accumulation blocking stormwater runoff from flowing into the stream.',
    assignedContractor: 'OCDA Youth Environmental Sanitation Corps',
    contractorEta: 'Desilting completed and drain opened',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    photoUrl: null,
  },
];

export function getStreetIssues() {
  try {
    const stored = localStorage.getItem('ogere_street_issues');
    return stored ? JSON.parse(stored) : SEED_ISSUES;
  } catch (_) {
    return SEED_ISSUES;
  }
}

export function reportStreetIssue(issueData) {
  const current = getStreetIssues();
  const newId = `FMS-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newIssue = {
    id: newId,
    title: issueData.title,
    category: issueData.category || 'pothole_road',
    quarter: issueData.quarter || 'Oke-Ogere',
    location: issueData.location,
    latitude: issueData.latitude || 6.9368,
    longitude: issueData.longitude || 3.6330,
    severity: issueData.severity || 'MEDIUM',
    status: 'REPORTED',
    upvotes: 1,
    reporterName: issueData.reporterName || 'Concerned Citizen',
    description: issueData.description,
    assignedContractor: 'OCDA Public Works Triage Desk',
    contractorEta: 'Under assessment',
    reportedAt: new Date().toISOString(),
    photoUrl: issueData.photoUrl || null,
  };

  const updated = [newIssue, ...current];
  try {
    localStorage.setItem('ogere_street_issues', JSON.stringify(updated));
  } catch (_) {}

  broadcastFmsEvent('ogere-fms-updated', newIssue);
  return newIssue;
}

export function upvoteStreetIssue(issueId) {
  const current = getStreetIssues();
  const updated = current.map((i) => (i.id === issueId ? { ...i, upvotes: i.upvotes + 1 } : i));
  try {
    localStorage.setItem('ogere_street_issues', JSON.stringify(updated));
  } catch (_) {}
  const target = updated.find((i) => i.id === issueId);
  broadcastFmsEvent('ogere-fms-updated', target);
  return target;
}

export function getPowerGridStatus() {
  try {
    const stored = localStorage.getItem('ogere_power_grid_status');
    return stored ? JSON.parse(stored) : OGERE_QUARTERS;
  } catch (_) {
    return OGERE_QUARTERS;
  }
}

export function toggleQuarterPower(quarterId) {
  const current = getPowerGridStatus();
  const updated = current.map((q) => {
    if (q.id === quarterId) {
      const isNowOn = q.powerStatus === 'OFF';
      return {
        ...q,
        powerStatus: isNowOn ? 'ON' : 'OFF',
        lastPowerChange: 'Just now',
        loadRating: isNowOn ? '75%' : '0%',
      };
    }
    return q;
  });

  try {
    localStorage.setItem('ogere_power_grid_status', JSON.stringify(updated));
  } catch (_) {}

  broadcastFmsEvent('ogere-power-grid-updated', updated);
  return updated;
}

function broadcastFmsEvent(eventName, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}
