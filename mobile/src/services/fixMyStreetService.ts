// mobile/src/services/fixMyStreetService.ts
// Civic Infrastructure, Public Works & IBEDC Power Grid Monitor for Ogere Remo Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IssueCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface QuarterPowerStatus {
  id: string;
  name: string;
  powerStatus: 'ON' | 'OFF';
  lastPowerChange: string;
  transformer: string;
  loadRating: string;
}

export interface StreetIssue {
  id: string;
  title: string;
  category: string;
  quarter: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'INVESTIGATING' | 'CONTRACTOR_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  upvotes: number;
  reporterName: string;
  description: string;
  assignedContractor: string | null;
  contractorEta: string | null;
  reportedAt: string;
  photoUrl: string | null;
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  { id: 'pothole_road', label: 'Road Damage & Potholes', icon: '🚧', color: '#f59e0b' },
  { id: 'power_transformer', label: 'IBEDC Transformer / Blackout', icon: '⚡', color: '#eab308' },
  { id: 'drainage_flooding', label: 'Clogged Drainage & Flooding', icon: '🌊', color: '#38bdf8' },
  { id: 'streetlight_fault', label: 'Solar Streetlight Malfunction', icon: '💡', color: '#a855f7' },
  { id: 'water_pipe_leak', label: 'Public Borehole / Pipe Burst', icon: '🚰', color: '#06b6d4' },
  { id: 'waste_dump', label: 'Illegal Waste Dump & Sanitation', icon: '🗑️', color: '#ef4444' },
];

export const OGERE_QUARTERS: QuarterPowerStatus[] = [
  { id: 'oke_ogere', name: 'Oke-Ogere Quarter', powerStatus: 'ON', lastPowerChange: '3 hrs ago', transformer: 'Central Palace 500kVA', loadRating: '84%' },
  { id: 'isale_ogere', name: 'Isale-Ogere Quarter', powerStatus: 'ON', lastPowerChange: '5 hrs ago', transformer: 'Hospital Road 300kVA', loadRating: '76%' },
  { id: 'ijana', name: 'Ijana Quarter', powerStatus: 'OFF', lastPowerChange: '45 mins ago', transformer: 'Ijana Link 500kVA', loadRating: '0% (Tripped)' },
  { id: 'agbele', name: 'Agbele Ancestral Corridor', powerStatus: 'ON', lastPowerChange: '1 hr ago', transformer: 'Agbele Substation 300kVA', loadRating: '62%' },
  { id: 'expressway_toll', name: 'Expressway & Tollgate Hub', powerStatus: 'ON', lastPowerChange: '8 hrs ago', transformer: 'Industrial Feeder 1MVA', loadRating: '91%' },
];

const SEED_ISSUES: StreetIssue[] = [
  {
    id: 'FMS-2026-104',
    title: 'Severe Asphalt Potholes on Palace Way near Town Hall',
    category: 'pothole_road',
    quarter: 'Oke-Ogere',
    location: 'Palace Way, directly opposite OCDA Secretariat',
    latitude: 6.9368,
    longitude: 3.6330,
    severity: 'HIGH',
    status: 'CONTRACTOR_ASSIGNED',
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
    quarter: 'Oke-Ogere',
    location: 'Oja Oba Periphery Drain Line 2',
    latitude: 6.9358,
    longitude: 3.6341,
    severity: 'MEDIUM',
    status: 'RESOLVED',
    upvotes: 19,
    reporterName: 'Alhaja Simbiat',
    description: 'Debris accumulated in drain causing rainwater to overflow into market stalls.',
    assignedContractor: 'OCDA Sanitation & Youth Taskforce',
    contractorEta: 'Cleared and evacuated on Tuesday',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    photoUrl: null,
  },
];

const STORAGE_KEY = 'ogere_fix_my_street_v1';

export async function getStreetIssues(): Promise<StreetIssue[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ISSUES));
      return SEED_ISSUES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ISSUES;
  }
}

export async function reportStreetIssue(payload: Partial<StreetIssue>): Promise<StreetIssue> {
  const current = await getStreetIssues();
  const id = `FMS-${new Date().getFullYear()}-${String(current.length + 105).padStart(3, '0')}`;

  const newIssue: StreetIssue = {
    id,
    title: payload.title || 'Untitled Civic Issue',
    category: payload.category || 'pothole_road',
    quarter: payload.quarter || 'Oke-Ogere',
    location: payload.location || 'Ogere Remo',
    latitude: payload.latitude || 6.9371,
    longitude: payload.longitude || 3.6335,
    severity: payload.severity || 'MEDIUM',
    status: 'REPORTED',
    upvotes: 1,
    reporterName: payload.reporterName || 'Concerned Citizen',
    description: payload.description || '',
    assignedContractor: null,
    contractorEta: 'Pending OCDA Assessment',
    reportedAt: new Date().toISOString(),
    photoUrl: payload.photoUrl || null,
  };

  const updated = [newIssue, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newIssue;
}

export async function upvoteIssue(issueId: string): Promise<StreetIssue[]> {
  const current = await getStreetIssues();
  const updated = current.map((item) =>
    item.id === issueId ? { ...item, upvotes: item.upvotes + 1 } : item
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
