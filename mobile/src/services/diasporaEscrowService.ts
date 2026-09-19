// mobile/src/services/diasporaEscrowService.ts
// Diaspora Homeland Capital Projects & Milestone Escrow Grants Engine for Ogere Remo Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Milestone {
  id: string;
  title: string;
  percentage: number;
  amountNgn: number;
  status: 'LOCKED_ESCROW' | 'VERIFICATION_PENDING' | 'RELEASED';
  evidence: string;
  releasedAt: string | null;
}

export interface EscrowProject {
  id: string;
  title: string;
  category: 'INFRASTRUCTURE' | 'HEALTHCARE' | 'EDUCATION' | 'SECURITY' | 'HERITAGE';
  location: string;
  targetBudgetNgn: number;
  targetBudgetUsd: number;
  raisedNgn: number;
  escrowLockedNgn: number;
  releasedNgn: number;
  status: 'FUNDING' | 'IN_EXECUTION' | 'VERIFICATION_PENDING' | 'COMPLETED';
  leadContractor: string;
  leadSupervisor: string;
  palaceSignatory: string;
  donorsCount: number;
  completionPercentage: number;
  milestones: Milestone[];
  coverImage?: string;
  description: string;
}

export const ESCROW_PROJECTS: EscrowProject[] = [
  {
    id: 'ESC-PRJ-01',
    title: 'Solar Streetlight Grid Phase II (Town Core & Oja Oba)',
    category: 'INFRASTRUCTURE',
    location: 'Palace Way to Isale-Ogere Hospital Axis (4.2km)',
    targetBudgetNgn: 18500000,
    targetBudgetUsd: 12500,
    raisedNgn: 14800000,
    escrowLockedNgn: 8880000,
    releasedNgn: 5920000,
    status: 'IN_EXECUTION',
    leadContractor: 'Solaris Energy Africa Ltd & OCDA Works',
    leadSupervisor: 'Engr. Folake Sobukonla (OCDA)',
    palaceSignatory: 'HRH Ologere & Inner Royal Council',
    donorsCount: 42,
    completionPercentage: 65,
    milestones: [
      {
        id: 'm1',
        title: 'Milestone 1: Structural Poles & Battery Procurement',
        percentage: 30,
        amountNgn: 5550000,
        status: 'RELEASED',
        evidence: '50 galvanized poles delivered and inspected at Town Hall depot.',
        releasedAt: '2026-08-15',
      },
      {
        id: 'm2',
        title: 'Milestone 2: Concrete Foundations & Panel Installation',
        percentage: 40,
        amountNgn: 7400000,
        status: 'VERIFICATION_PENDING',
        evidence: '38/50 streetlights erected and tested with illumination lux report.',
        releasedAt: null,
      },
      {
        id: 'm3',
        title: 'Milestone 3: Grid Commissioning & Palace Handover Sign-off',
        percentage: 30,
        amountNgn: 5550000,
        status: 'LOCKED_ESCROW',
        evidence: 'Awaiting 14-day continuous nighttime burn-in audit.',
        releasedAt: null,
      },
    ],
    description: 'Transforming nighttime security and market commerce by installing 50 high-output 150W solar LED streetlights across the town core.',
  },
  {
    id: 'ESC-PRJ-02',
    title: 'Ogere Health Centre Maternity Solar Cold-Chain & Oxygen Unit',
    category: 'HEALTHCARE',
    location: 'Ogere State Hospital Compound, Isale-Ogere',
    targetBudgetNgn: 12000000,
    targetBudgetUsd: 8000,
    raisedNgn: 12000000,
    escrowLockedNgn: 3600000,
    releasedNgn: 8400000,
    status: 'VERIFICATION_PENDING',
    leadContractor: 'BioHealth Tech West Africa & Dr. Agbato Health Foundation',
    leadSupervisor: 'Dr. (Mrs.) Yewande Solarin',
    palaceSignatory: 'Ologere Health Council',
    donorsCount: 31,
    completionPercentage: 85,
    milestones: [
      {
        id: 'm1',
        title: 'Milestone 1: Medical Grade Solar Inverter & Battery Bank',
        percentage: 40,
        amountNgn: 4800000,
        status: 'RELEASED',
        evidence: '10kVA Lithium solar backup system installed and load tested.',
        releasedAt: '2026-07-20',
      },
      {
        id: 'm2',
        title: 'Milestone 2: Vaccine Refrigeration & Oxygen Concentrators',
        percentage: 30,
        amountNgn: 3600000,
        status: 'RELEASED',
        evidence: '2 dual-temp vaccine fridges and 3 oxygen concentrators operational.',
        releasedAt: '2026-08-30',
      },
      {
        id: 'm3',
        title: 'Milestone 3: Maternity Ward Refurbishment & Telemedicine Terminal',
        percentage: 30,
        amountNgn: 3600000,
        status: 'VERIFICATION_PENDING',
        evidence: 'Awaiting final clinical audit inspection by Ogun State MoH.',
        releasedAt: null,
      },
    ],
    description: 'Equipping the maternal ward with 24/7 solar cold-chain for vaccines and neonatal oxygen delivery.',
  },
];

const STORAGE_KEY = 'ogere_diaspora_escrow_v1';

export async function getEscrowProjects(): Promise<EscrowProject[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ESCROW_PROJECTS));
      return ESCROW_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return ESCROW_PROJECTS;
  }
}
