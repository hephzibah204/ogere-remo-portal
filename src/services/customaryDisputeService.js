// src/services/customaryDisputeService.js
// Royal Customary Dispute Arbitration System ("Kootu Oba") for Ogere Remo Kingdom

export const DISPUTE_CATEGORIES = [
  { id: 'land_boundary', label: 'Land & Boundary Dispute', icon: '🗺️', desc: 'Plot demarcation, ancestral farmland boundaries, road encroachments' },
  { id: 'family_inheritance', label: 'Family & Inheritance Conflict', icon: '👨‍👩‍👧‍👦', desc: 'Estate administration, family compound rights, succession' },
  { id: 'tenancy_property', label: 'Tenancy & Property Grievance', icon: '🏠', desc: 'Commercial shop rent, residential tenancy, lease disputes' },
  { id: 'market_trade', label: 'Market & Trade Dispute', icon: '🛒', desc: 'Oja Oba market stalls, trade associations, debtor-creditor mediation' },
  { id: 'chieftaincy_custom', label: 'Chieftaincy & Customary Protocol', icon: '👑', desc: 'Family titles, quarter rites, traditional customary observance' },
  { id: 'civic_neighborhood', label: 'Neighborhood & Civic Discord', icon: '🤝', desc: 'Noise nuisance, drainage overflow, compound peaceful coexistence' },
];

export const PALACE_ARBITRATORS = [
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

const SEED_DISPUTES = [
  {
    id: 'DIS-2026-081',
    title: 'Demarcation of Agbele Boundary Link Farmland',
    category: 'land_boundary',
    complainant: {
      fullName: 'Pa Amosun Olalekan',
      phone: '08033221199',
      compound: 'Agbole Lisa',
      quarter: 'Oke-Ogere',
    },
    respondent: {
      fullName: 'Chief Ganiyu Arowolo',
      phone: '08022446688',
      compound: 'Agbole Jagunna',
      quarter: 'Agbele Corridor',
    },
    location: 'Agbele Farmlands Link Road, Boundary Pillar #14',
    assignedArbitrator: PALACE_ARBITRATORS[0],
    status: 'HEARING_SCHEDULED', // FILED, UNDER_REVIEW, HEARING_SCHEDULED, MEDIATION_IN_PROGRESS, DECREE_ISSUED, CLOSED
    hearingDate: '2026-09-24',
    hearingTime: '11:00 AM',
    hearingVenue: 'Inner Royal Council Chamber, Aafin Ologere',
    virtualLink: 'https://meet.jit.si/OgerePalaceArbitration-DIS081',
    description: 'Dispute over boundary markers shifted during recent tractor plowing on ancestral palm plantation.',
    arbitratorNotes: 'Both families summoned with survey sketches and original title grant deeds.',
    decreeSummary: null,
    filedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'DIS-2026-074',
    title: 'Oja Oba Market Corner Stalls Succession',
    category: 'market_trade',
    complainant: {
      fullName: 'Alhaja Kudirat Balogun',
      phone: '08098765412',
      compound: 'Ile Ologere',
      quarter: 'Central Town',
    },
    respondent: {
      fullName: 'Mrs. Titilayo Adebisi',
      phone: '08055667788',
      compound: 'Agbole Balogun',
      quarter: 'Isale-Ogere',
    },
    location: 'Oja Oba Central Market, Stalls C12 & C13',
    assignedArbitrator: PALACE_ARBITRATORS[3],
    status: 'DECREE_ISSUED',
    hearingDate: '2026-09-12',
    hearingTime: '10:00 AM',
    hearingVenue: 'Oba Council Secretariat Wing',
    virtualLink: null,
    description: 'Ownership rights to heritage lockup shops after the passing of family matriarch.',
    arbitratorNotes: 'Mutual sharing agreement finalized in presence of Market Association delegates.',
    decreeSummary: 'Stall C12 allocated to Complainant, Stall C13 allocated to Respondent with shared maintenance levy.',
    decreeSealNumber: 'AAFIN-SEAL-2026-0912',
    filedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

export function getCustomaryDisputes() {
  try {
    const stored = localStorage.getItem('ogere_customary_disputes');
    return stored ? JSON.parse(stored) : SEED_DISPUTES;
  } catch (_) {
    return SEED_DISPUTES;
  }
}

export function fileCustomaryDispute(disputeData) {
  const current = getCustomaryDisputes();
  const newId = `DIS-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Default arbitrator based on category
  let defaultArb = PALACE_ARBITRATORS[0];
  if (disputeData.category === 'market_trade') defaultArb = PALACE_ARBITRATORS[3];
  else if (disputeData.category === 'family_inheritance') defaultArb = PALACE_ARBITRATORS[1];
  else if (disputeData.category === 'tenancy_property' || disputeData.category === 'civic_neighborhood') defaultArb = PALACE_ARBITRATORS[2];

  const newRecord = {
    id: newId,
    title: disputeData.title,
    category: disputeData.category || 'land_boundary',
    complainant: {
      fullName: disputeData.complainantName,
      phone: disputeData.complainantPhone,
      compound: disputeData.complainantCompound || 'General',
      quarter: disputeData.complainantQuarter || 'Oke-Ogere',
    },
    respondent: {
      fullName: disputeData.respondentName,
      phone: disputeData.respondentPhone,
      compound: disputeData.respondentCompound || 'General',
      quarter: disputeData.respondentQuarter || 'Isale-Ogere',
    },
    location: disputeData.location || 'Ogere Remo',
    assignedArbitrator: defaultArb,
    status: 'UNDER_REVIEW',
    hearingDate: disputeData.hearingDate || null,
    hearingTime: disputeData.hearingTime || null,
    hearingVenue: 'Inner Royal Council Chamber, Aafin Ologere',
    virtualLink: `https://meet.jit.si/OgerePalaceArbitration-${newId}`,
    description: disputeData.description,
    arbitratorNotes: 'Case acknowledged by Palace Registrar. Parties being notified.',
    decreeSummary: null,
    filedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  try {
    localStorage.setItem('ogere_customary_disputes', JSON.stringify(updated));
  } catch (_) {}

  broadcastDisputeEvent('ogere-dispute-updated', newRecord);
  return newRecord;
}

export function updateDisputeStatus(disputeId, { status, hearingDate, hearingTime, arbitratorNotes, decreeSummary }) {
  const current = getCustomaryDisputes();
  const updated = current.map((d) => {
    if (d.id === disputeId) {
      return {
        ...d,
        status: status || d.status,
        hearingDate: hearingDate || d.hearingDate,
        hearingTime: hearingTime || d.hearingTime,
        arbitratorNotes: arbitratorNotes || d.arbitratorNotes,
        decreeSummary: decreeSummary || d.decreeSummary,
        decreeSealNumber: decreeSummary && !d.decreeSealNumber ? `AAFIN-SEAL-2026-${Date.now().toString().slice(-4)}` : d.decreeSealNumber,
        updatedAt: new Date().toISOString(),
      };
    }
    return d;
  });

  try {
    localStorage.setItem('ogere_customary_disputes', JSON.stringify(updated));
  } catch (_) {}

  const modified = updated.find((d) => d.id === disputeId);
  broadcastDisputeEvent('ogere-dispute-updated', modified);
  return modified;
}

function broadcastDisputeEvent(eventName, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}
