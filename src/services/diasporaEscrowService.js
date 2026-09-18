// src/services/diasporaEscrowService.js
// Diaspora Homeland Capital Projects & Milestone Escrow Grants Engine

export const ESCROW_PROJECTS = [
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
    status: 'IN_EXECUTION', // FUNDING, IN_EXECUTION, VERIFICATION_PENDING, COMPLETED
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
    coverImage: '/assets/images/solar-lights-ogere.jpg',
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
    status: 'IN_EXECUTION',
    leadContractor: 'Biomed MedTech Systems & Ogun Health Board',
    leadSupervisor: 'Dr. Folashade Adeyemi (Diaspora UK Team)',
    palaceSignatory: 'Ologere Royal Health Secretariat',
    donorsCount: 68,
    completionPercentage: 80,
    milestones: [
      {
        id: 'm1',
        title: 'Milestone 1: 5kVA Solar Inverter & LiFePO4 Battery Setup',
        percentage: 40,
        amountNgn: 4800000,
        status: 'RELEASED',
        evidence: 'Continuous 24/7 power established for maternity ward.',
        releasedAt: '2026-07-20',
      },
      {
        id: 'm2',
        title: 'Milestone 2: Vaccine Refrigeration & 2x Oxygen Concentrators',
        percentage: 30,
        amountNgn: 3600000,
        status: 'RELEASED',
        evidence: 'WHO-certified solar vaccine cooler installed and temperature-logged.',
        releasedAt: '2026-09-02',
      },
      {
        id: 'm3',
        title: 'Milestone 3: Hospital Staff Training & Joint Commissioning',
        percentage: 30,
        amountNgn: 3600000,
        status: 'LOCKED_ESCROW',
        evidence: 'Clinical test run on obstetric care patients in progress.',
        releasedAt: null,
      },
    ],
    coverImage: '/assets/images/health-solar-ogere.jpg',
    description: 'Ensuring zero neonatal fatalities due to power failure by providing uninterruptible solar power for maternity incubators and vaccine cold-storage.',
  },
  {
    id: 'ESC-PRJ-03',
    title: 'Ogere Youth Tech & AI Innovation Bootcamp Hub',
    category: 'EDUCATION',
    location: 'Ogere Community Civic Center (Upper Hall)',
    targetBudgetNgn: 9500000,
    targetBudgetUsd: 6400,
    raisedNgn: 5800000,
    escrowLockedNgn: 5800000,
    releasedNgn: 0,
    status: 'FUNDING',
    leadContractor: 'Hephzibah Edutech Hub & OCDA Youth Wing',
    leadSupervisor: 'Mr. Babatunde Alabi',
    palaceSignatory: 'Royal Council for Youth Development',
    donorsCount: 31,
    completionPercentage: 35,
    milestones: [
      {
        id: 'm1',
        title: 'Milestone 1: High-Speed Starlink Satellite & 20x Laptops',
        percentage: 50,
        amountNgn: 4750000,
        status: 'LOCKED_ESCROW',
        evidence: 'Awaiting minimum 80% funding threshold before procurement release.',
        releasedAt: null,
      },
      {
        id: 'm2',
        title: 'Milestone 2: Lab Workstation Desks, Solar Backup & Curriculum',
        percentage: 50,
        amountNgn: 4750000,
        status: 'LOCKED_ESCROW',
        evidence: 'Curriculum accredited with Nigerian Tech Alliance.',
        releasedAt: null,
      },
    ],
    coverImage: '/assets/images/youth-tech-ogere.jpg',
    description: 'Training 200 Ogere youths annually in Full-Stack Software Engineering, AI prompt development, and Digital Commerce to secure remote global jobs.',
  },
];

const SEED_DONORS = [
  { id: 'd-1', name: 'Dr. Ademola Adeleke', location: 'London, United Kingdom', amountNgn: 2500000, currency: 'GBP (£1,300)', projectTitle: 'Solar Streetlight Grid Phase II', date: '2026-09-10' },
  { id: 'd-2', name: 'Engr. & Mrs. Tunde Solarin', location: 'Houston, Texas, USA', amountNgn: 3000000, currency: 'USD ($2,000)', projectTitle: 'Ogere Health Centre Maternity Solar', date: '2026-09-08' },
  { id: 'd-3', name: 'Chief (Mrs.) Bimbo Olanrewaju', location: 'Toronto, Canada', amountNgn: 1500000, currency: 'CAD ($1,350)', projectTitle: 'Youth Tech Hub', date: '2026-09-14' },
  { id: 'd-4', name: 'Ogere Club 80s Diaspora Chapter', location: 'Dublin, Ireland', amountNgn: 4000000, currency: 'EUR (€2,400)', projectTitle: 'Solar Streetlight Grid Phase II', date: '2026-08-28' },
  { id: 'd-5', name: 'Alhaji Rasheed Balogun', location: 'Lagos / Ogere Remo', amountNgn: 1000000, currency: 'NGN (₦1,000,000)', projectTitle: 'Ogere Health Centre Maternity Solar', date: '2026-09-16' },
];

export function getEscrowProjects() {
  try {
    const stored = localStorage.getItem('ogere_escrow_projects');
    return stored ? JSON.parse(stored) : ESCROW_PROJECTS;
  } catch (_) {
    return ESCROW_PROJECTS;
  }
}

export function getDonorsLedger() {
  try {
    const stored = localStorage.getItem('ogere_escrow_donors');
    return stored ? JSON.parse(stored) : SEED_DONORS;
  } catch (_) {
    return SEED_DONORS;
  }
}

export function contributeToEscrowProject(projectId, pledgeData) {
  const currentProjects = getEscrowProjects();
  const currentDonors = getDonorsLedger();
  const amountNgn = Number(pledgeData.amountNgn) || 50000;

  const updatedProjects = currentProjects.map((p) => {
    if (p.id === projectId) {
      const newRaised = p.raisedNgn + amountNgn;
      const newLocked = p.escrowLockedNgn + amountNgn;
      const newPct = Math.min(100, Math.round((newRaised / p.targetBudgetNgn) * 100));
      return {
        ...p,
        raisedNgn: newRaised,
        escrowLockedNgn: newLocked,
        donorsCount: p.donorsCount + 1,
        status: newRaised >= p.targetBudgetNgn && p.status === 'FUNDING' ? 'IN_EXECUTION' : p.status,
      };
    }
    return p;
  });

  const newDonor = {
    id: `d-${Date.now()}`,
    name: pledgeData.donorName || 'Anonymous Ogere Patriot',
    location: pledgeData.donorLocation || 'Diaspora',
    amountNgn: amountNgn,
    currency: pledgeData.currencyString || `NGN (₦${amountNgn.toLocaleString()})`,
    projectTitle: updatedProjects.find((p) => p.id === projectId)?.title || 'Homeland Project',
    date: new Date().toISOString().split('T')[0],
  };

  const updatedDonors = [newDonor, ...currentDonors];

  try {
    localStorage.setItem('ogere_escrow_projects', JSON.stringify(updatedProjects));
    localStorage.setItem('ogere_escrow_donors', JSON.stringify(updatedDonors));
  } catch (_) {}

  broadcastEscrowEvent('ogere-escrow-updated', { project: updatedProjects.find((p) => p.id === projectId), donor: newDonor });
  return { success: true, project: updatedProjects.find((p) => p.id === projectId), donor: newDonor };
}

export function releaseMilestoneEscrow(projectId, milestoneId, verificationNotes) {
  const currentProjects = getEscrowProjects();
  const updatedProjects = currentProjects.map((p) => {
    if (p.id === projectId) {
      let releasedAmt = 0;
      const updatedMilestones = p.milestones.map((m) => {
        if (m.id === milestoneId) {
          releasedAmt = m.amountNgn;
          return {
            ...m,
            status: 'RELEASED',
            evidence: verificationNotes || m.evidence,
            releasedAt: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      });

      return {
        ...p,
        escrowLockedNgn: Math.max(0, p.escrowLockedNgn - releasedAmt),
        releasedNgn: p.releasedNgn + releasedAmt,
        milestones: updatedMilestones,
        status: updatedMilestones.every((m) => m.status === 'RELEASED') ? 'COMPLETED' : p.status,
      };
    }
    return p;
  });

  try {
    localStorage.setItem('ogere_escrow_projects', JSON.stringify(updatedProjects));
  } catch (_) {}

  const target = updatedProjects.find((p) => p.id === projectId);
  broadcastEscrowEvent('ogere-escrow-updated', { project: target });
  return target;
}

function broadcastEscrowEvent(eventName, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}
