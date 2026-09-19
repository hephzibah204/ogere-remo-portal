// mobile/src/services/customaryDisputeService.ts
// Royal Customary Dispute Arbitration System ("Kootu Oba") for Ogere Remo Kingdom Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DisputeCategory {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export interface Arbitrator {
  id: string;
  name: string;
  title: string;
  rank: string;
  quarter: string;
  specialty: string;
  avatar: string;
}

export interface DisputeCase {
  id: string;
  trackingCode: string;
  category: string;
  title: string;
  plaintiffName: string;
  plaintiffPhone: string;
  plaintiffNin?: string;
  plaintiffQuarter: string;
  respondentName: string;
  respondentPhone: string;
  respondentQuarter: string;
  location: string;
  status: 'FILED' | 'SUMMONS_ISSUED' | 'HEARING_SCHEDULED' | 'MEDIATION_IN_PROGRESS' | 'ROYAL_DECREE_ISSUED' | 'DISMISSED';
  arbitratorId: string;
  hearingDate: string | null;
  hearingChamber: string;
  description: string;
  decreeSummary: string | null;
  decreeSeal: string | null;
  palaceOathAcknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DISPUTE_CATEGORIES: DisputeCategory[] = [
  { id: 'land_boundary', label: 'Land & Boundary Dispute', icon: '🗺️', desc: 'Plot demarcation, ancestral farmland boundaries, road encroachments' },
  { id: 'family_inheritance', label: 'Family & Inheritance Conflict', icon: '👨‍👩‍👧‍👦', desc: 'Estate administration, family compound rights, succession' },
  { id: 'tenancy_property', label: 'Tenancy & Property Grievance', icon: '🏠', desc: 'Commercial shop rent, residential tenancy, lease disputes' },
  { id: 'market_trade', label: 'Market & Trade Dispute', icon: '🛒', desc: 'Oja Oba market stalls, trade associations, debtor-creditor mediation' },
  { id: 'chieftaincy_custom', label: 'Chieftaincy & Customary Protocol', icon: '👑', desc: 'Family titles, quarter rites, traditional customary observance' },
  { id: 'civic_neighborhood', label: 'Neighborhood & Civic Discord', icon: '🤝', desc: 'Noise nuisance, drainage overflow, compound peaceful coexistence' },
];

export const PALACE_ARBITRATORS: Arbitrator[] = [
  {
    id: 'arb-01',
    name: 'High Chief Rasheed Adeleke',
    title: 'The Oliwo of Ogere Remo',
    rank: 'Senior Kingmaker & Chief Arbitrator',
    quarter: 'Oke-Ogere',
    specialty: 'Land, Chieftaincy & Ancestral Demarcation',
    avatar: '👑',
  },
  {
    id: 'arb-02',
    name: 'Chief Adebayo Solarin',
    title: 'The Lisa of Ogere Remo',
    rank: 'Palace Chancellor & Mediation Lead',
    quarter: 'Ijana',
    specialty: 'Family Estate, Inheritance & Traditional Succession',
    avatar: '📜',
  },
  {
    id: 'arb-03',
    name: 'Baale Gbadamosi Alabi',
    title: 'Baale of Isale-Ogere',
    rank: 'Quarter Baale & Community Magistrate',
    quarter: 'Isale-Ogere',
    specialty: 'Tenancy, Housing & Neighborhood Harmony',
    avatar: '🏛️',
  },
  {
    id: 'arb-04',
    name: 'Chief (Mrs.) Folashade Oduwole',
    title: 'Iyalode of Ogere Remo',
    rank: 'Grand Market Matron & Trade Arbitrator',
    quarter: 'Oja Oba Market Axis',
    specialty: 'Commerce, Market Stall Allocation & Trade Mediation',
    avatar: '⚖️',
  },
  {
    id: 'arb-05',
    name: 'Barr. Olumide Ogunseye',
    title: 'Palace Legal Secretary & Registrar',
    rank: 'Customary Law Assessor',
    quarter: 'Royal Secretariat',
    specialty: 'Customary Law, Written Declarations & Court Harmony',
    avatar: '⚖️',
  },
];

const SEED_DISPUTES: DisputeCase[] = [
  {
    id: 'DISP-2026-001',
    trackingCode: 'KOB-7821',
    category: 'land_boundary',
    title: 'Encroachment on Agbele Farmland Boundary Demarcation',
    plaintiffName: 'Chief Olusegun Odutola',
    plaintiffPhone: '08034567890',
    plaintiffQuarter: 'Agbele Corridor',
    respondentName: 'Pa Matthew Adeleke',
    respondentPhone: '08123456789',
    respondentQuarter: 'Oke-Ogere',
    location: 'Agbele Road, Plot 4B boundary with Odutola Ancestral Estate',
    status: 'HEARING_SCHEDULED',
    arbitratorId: 'arb-01',
    hearingDate: '2026-09-24T10:00:00.000Z',
    hearingChamber: 'Aafin Ologere Outer Council Chamber',
    description: 'Survey pillar erected in 1984 was uprooted during boundary fencing construction.',
    decreeSummary: null,
    decreeSeal: null,
    palaceOathAcknowledged: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'DISP-2026-002',
    trackingCode: 'KOB-4412',
    category: 'market_trade',
    title: 'Oja Oba Market Lineage Stall Succession Dispute',
    plaintiffName: 'Mrs. Abigail Sowemimo',
    plaintiffPhone: '08098765432',
    plaintiffQuarter: 'Ijana Quarter',
    respondentName: 'Mrs. Kemi Adeyemi',
    respondentPhone: '07033322211',
    respondentQuarter: 'Isale-Ogere',
    location: 'Oja Oba Central Market, Line 3 Stall C12',
    status: 'ROYAL_DECREE_ISSUED',
    arbitratorId: 'arb-04',
    hearingDate: '2026-09-10T11:00:00.000Z',
    hearingChamber: 'Iyalode Market Chamber',
    description: 'Dispute over hereditary rights to family textile stall following grandmother transition.',
    decreeSummary: 'Stall C12 allocated to Complainant, Stall C13 allocated to Respondent with shared maintenance levy.',
    decreeSeal: 'ROYAL_SEAL_OLOGERE_CUSTOMARY_APPROVED',
    palaceOathAcknowledged: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const STORAGE_KEY = 'ogere_customary_disputes_v1';

export async function getDisputes(): Promise<DisputeCase[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DISPUTES));
      return SEED_DISPUTES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DISPUTES;
  }
}

export async function fileNewDispute(payload: Partial<DisputeCase>): Promise<DisputeCase> {
  const current = await getDisputes();
  const trackingCode = `KOB-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = `DISP-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`;

  const newCase: DisputeCase = {
    id,
    trackingCode,
    category: payload.category || 'land_boundary',
    title: payload.title || 'Untitled Dispute',
    plaintiffName: payload.plaintiffName || 'Anonymous Citizen',
    plaintiffPhone: payload.plaintiffPhone || '',
    plaintiffNin: payload.plaintiffNin,
    plaintiffQuarter: payload.plaintiffQuarter || 'Oke-Ogere',
    respondentName: payload.respondentName || 'Opposing Party',
    respondentPhone: payload.respondentPhone || '',
    respondentQuarter: payload.respondentQuarter || 'Isale-Ogere',
    location: payload.location || 'Ogere Remo',
    status: 'FILED',
    arbitratorId: payload.arbitratorId || 'arb-01',
    hearingDate: null,
    hearingChamber: 'Aafin Ologere Outer Council Chamber',
    description: payload.description || '',
    decreeSummary: null,
    decreeSeal: null,
    palaceOathAcknowledged: Boolean(payload.palaceOathAcknowledged),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newCase, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newCase;
}
