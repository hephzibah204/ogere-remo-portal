/**
 * Ogere Remo Unified Database Engine
 * Handles persistent storage across LocalStorage / IndexedDB with full CRUD operations,
 * automated collection indexing, and event subscriptions.
 */

const STORAGE_PREFIX = 'ogere_db_';

// Initial Seed Data for all major portal collections
export const SEED_DATA = {
  id_cards: [
    {
      id: 'OGR-782910',
      fullName: 'Adewale Babatunde Ogunleke',
      cardType: 'indigene',
      dob: '1992-06-14',
      compound: 'Kankanbina',
      quarter: 'Oke-Ogere',
      phone: '08034512345',
      email: 'adewale.ogunleke@gmail.com',
      address: '14 Palace Way, Oke-Ogere, Ogere Remo',
      occupation: 'Civil Engineer',
      status: 'approved',
      issuedDate: '2024-01-15',
      expiryDate: '2027-01-15',
      photoUrl: '',
      verifiedBy: 'HRH Ologere Palace Office',
      createdAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'OGR-D-492019',
      fullName: 'Dr. Folashade Adeyemi-Clark',
      cardType: 'diaspora',
      dob: '1985-11-22',
      compound: 'Ejigboye',
      quarter: 'Isale-Ogere',
      phone: '+44 7911 123456',
      email: 'f.adeyemi@nhs.net',
      address: 'London, United Kingdom (Home: 3 Ejigboye St)',
      occupation: 'Consultant Surgeon',
      status: 'approved',
      issuedDate: '2024-03-01',
      expiryDate: '2027-03-01',
      photoUrl: '',
      verifiedBy: 'OCDA Diaspora Secretariat',
      createdAt: '2024-02-28T14:30:00Z',
    },
    {
      id: 'OGR-R-839201',
      fullName: 'Chief Emeka Okafor',
      cardType: 'resident',
      dob: '1978-04-09',
      compound: 'Other',
      quarter: 'Ajura Zone',
      phone: '08023456789',
      email: 'okafor.holdings@gmail.com',
      address: 'Plot 5 Expressway Corridor, Ogere',
      occupation: 'Logistics Director',
      status: 'approved',
      issuedDate: '2023-11-12',
      expiryDate: '2026-11-12',
      photoUrl: '',
      verifiedBy: 'Ogere Central Community Council',
      createdAt: '2023-11-05T09:15:00Z',
    },
  ],
  royal_audiences: [
    {
      id: 'AUD-2026-001',
      fullName: 'Chief Olumide Sobukonla',
      purpose: 'Community Project Briefing (Youth Skills Hub)',
      date: '2026-09-04',
      time: '11:00 AM',
      phone: '08031122334',
      email: 'olumide.sob@ogereyouths.ng',
      groupSize: '3',
      idCard: 'OGR-892102',
      message: 'Briefing HRH on the proposed Ikenne-Ogere ICT empowerment initiative supported by diaspora alumni.',
      status: 'confirmed',
      notes: 'Palace Secretary cleared: Room 2 Aafin.',
      createdAt: '2026-08-20T11:00:00Z',
    },
    {
      id: 'AUD-2026-002',
      fullName: 'Mrs. Titilayo Awobajo',
      purpose: 'Chieftaincy & Ancestral Compound Inquiry',
      date: '2026-09-11',
      time: '02:00 PM',
      phone: '08055544332',
      email: 'titi.awobajo@yahoo.com',
      groupSize: '2',
      idCard: 'OGR-782910',
      message: 'Documentation and royal recognition of the renovated Orowa ancestral lineage quarters.',
      status: 'pending',
      notes: 'Pending verification of compound elder signature.',
      createdAt: '2026-08-25T16:20:00Z',
    },
  ],
  land_registry: [
    {
      id: 'OGR-LND-001',
      area: 'Ajura Border Axis',
      owner: 'Ogunbade Family Trust',
      size: '12 Acres',
      use: 'Agricultural',
      status: 'Verified',
      date: '2023-04-12',
      coord: '6.9854° N, 3.6521° E',
      disputes: 0,
      documents: 'Gazette No. OG/2023/44, Survey Plan No. OG/LND/891',
    },
    {
      id: 'OGR-LND-002',
      area: 'Oke-Ogere Corridor',
      owner: 'Adebowale Compound',
      size: '2 Plots',
      use: 'Residential',
      status: 'Verified',
      date: '2024-01-05',
      coord: '6.9812° N, 3.6589° E',
      disputes: 0,
      documents: 'Approved Family Conveyance Deed 2024',
    },
    {
      id: 'OGR-LND-003',
      area: 'Expressway Bypass',
      owner: 'Ogere Resort Development Corp',
      size: '4 Acres',
      use: 'Commercial / Hospitality',
      status: 'Pending Survey',
      date: '2024-05-20',
      coord: '6.9740° N, 3.6480° E',
      disputes: 1,
      documents: 'Interim Survey Filing #492',
    },
    {
      id: 'OGR-LND-004',
      area: 'Idi-Iroko Sector',
      owner: 'Baba Tunde Afolabi',
      size: '1 Plot (600sqm)',
      use: 'Residential',
      status: 'Verified',
      date: '2019-11-08',
      coord: '6.9890° N, 3.6540° E',
      disputes: 0,
      documents: 'Deed of Gift & Allocation Certificate',
    },
    {
      id: 'OGR-LND-005',
      area: 'Remo-North Axis',
      owner: 'Kankanbina Royal Family Holding',
      size: '20 Acres',
      use: 'Mixed Use / Cultural Heritage',
      status: 'Verified',
      date: '2015-08-30',
      coord: '6.9780° N, 3.6610° E',
      disputes: 0,
      documents: 'Crown Demarcation Certificate 2015',
    },
    {
      id: 'OGR-LND-006',
      area: 'Market Road',
      owner: 'Iya Kike Traders Group',
      size: '1/2 Plot',
      use: 'Commercial Retail',
      status: 'Disputed',
      date: '2025-02-14',
      coord: '6.9830° N, 3.6570° E',
      disputes: 2,
      documents: 'Town Council Registry Receipt #0912',
    },
    {
      id: 'OGR-LND-007',
      area: 'Isale-Ogere',
      owner: 'OMCOOSA Alumni Association',
      size: '3 Plots',
      use: 'Educational / Recreational',
      status: 'Verified',
      date: '2021-09-10',
      coord: '6.9805° N, 3.6532° E',
      disputes: 0,
      documents: 'Trust Deed of Transfer & Educational Covenant',
    },
  ],
  marketplace: [
    {
      id: 'MKT-001',
      cat: 'Farm Produce',
      title: 'Fresh Ogere Yam — Grade A (Tuber & Bulk Bags)',
      desc: 'Premium white yam harvested from Ogere hills farms. Free delivery within Ogere town. 50kg bags available for diaspora and Lagos orders.',
      price: '₦4,500 / tuber',
      seller: 'Baba Adewale Farms',
      quarter: 'Oke-Ogere',
      phone: '08034512345',
      whatsapp: '2348034512345',
      icon: '🌾',
      badge: 'organic',
      verified: true,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: 'MKT-002',
      cat: 'Crafts & Adire',
      title: 'Handcrafted Adire Aso-Oke Ceremony Set (6 Yards)',
      desc: 'Authentic hand-dyed Adire fabric sets made by master artisans using traditional indigo technique. Ideal for weddings and Lipakala Day.',
      price: '₦18,000 / set',
      seller: 'Mama Kike Crafts & Fabrics',
      quarter: 'Isale-Ogere',
      phone: '08056781234',
      whatsapp: '2348056781234',
      icon: '🪡',
      badge: 'handmade',
      verified: true,
      status: 'active',
      createdAt: '2026-08-05T09:30:00Z',
    },
    {
      id: 'MKT-003',
      cat: 'Food & Catering',
      title: 'Ogere Traditional Event Catering (Yoruba Delicacies)',
      desc: 'Full catering for ceremonies, funerals, and coronations. Remo jollof, amala, egusi, and fresh palm wine. Minimum 50 guests.',
      price: 'From ₦2,500 / head',
      seller: 'Iya Seun Kitchen',
      quarter: 'Ago-Ogere',
      phone: '08067893456',
      whatsapp: '2348067893456',
      icon: '🍲',
      badge: 'popular',
      verified: true,
      status: 'active',
      createdAt: '2026-08-10T12:00:00Z',
    },
    {
      id: 'MKT-004',
      cat: 'Services',
      title: 'Electrical Wiring, Solar & Generator Maintenance',
      desc: 'Certified electrician for residential installations, inverter setups, and industrial repairs with 10 years experience across Remo.',
      price: 'Quote on request',
      seller: 'Engr. Tunde Afolabi',
      quarter: 'Idi-Iroko',
      phone: '08078904567',
      whatsapp: '2348078904567',
      icon: '⚡',
      badge: 'certified',
      verified: true,
      status: 'active',
      createdAt: '2026-08-12T14:00:00Z',
    },
    {
      id: 'MKT-005',
      cat: 'Farm Produce',
      title: 'Pure Cold-Pressed Ogere Red Palm Oil (25L Jerrycan)',
      desc: '100% unadulterated red palm oil sourced directly from community oil palm presses in Agbele. Excellent aroma and rich red colour.',
      price: '₦32,000 / 25L',
      seller: 'Ogere Agro Allied Farmers',
      quarter: 'Agbele Zone',
      phone: '08034519088',
      whatsapp: '2348034519088',
      icon: '🛢️',
      badge: 'fresh',
      verified: true,
      status: 'active',
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'MKT-006',
      cat: 'Fashion & Beads',
      title: 'Traditional Coral Royal Bead Necklaces & Crowns',
      desc: 'Genuine coral bead ornaments, chieftaincy wristlets, and beaded staff coverings crafted for titled chiefs and celebratory outings.',
      price: '₦25,000 / set',
      seller: 'Iya Oge Royal Crafts',
      quarter: 'Oke-Ogere',
      phone: '08051122334',
      whatsapp: '2348051122334',
      icon: '📿',
      badge: 'handmade',
      verified: true,
      status: 'active',
      createdAt: '2026-08-16T11:00:00Z',
    },
    {
      id: 'MKT-007',
      cat: 'Trade & Retail',
      title: 'Sharp River Sand, Crushed Granite & Dangote Cement',
      desc: 'Direct construction supplies delivered to your building site across Ogere and Ikenne LGA. Guaranteed fast offloading.',
      price: '₦65,000 / tripper',
      seller: 'Remo North Haulage Ltd',
      quarter: 'Expressway Bypass',
      phone: '08028876655',
      whatsapp: '2348028876655',
      icon: '🏗️',
      badge: 'bulk',
      verified: true,
      status: 'active',
      createdAt: '2026-08-18T09:00:00Z',
    },
    {
      id: 'MKT-008',
      cat: 'Property',
      title: '2 Verified Freehold Plots for Sale along Ajura Road',
      desc: 'Prime dry land with verified family gazette and survey documentation. 5 minutes drive from Ogere Town Hall. No disputes.',
      price: '₦2,800,000 / plot',
      seller: 'Kankanbina Realtors',
      quarter: 'Ajura Zone',
      phone: '08039987766',
      whatsapp: '2348039987766',
      icon: '🏡',
      badge: 'registered',
      verified: true,
      status: 'active',
      createdAt: '2026-08-20T15:00:00Z',
    },
    {
      id: 'MKT-009',
      cat: 'Food & Catering',
      title: 'Smoked Ogere Catfish & Spicy Kilishi Bush Meat (Packs)',
      desc: 'Oven-dried premium catfish and seasoned lean meat packs. Vacuum sealed for travelers, local kitchens, and diaspora shipment.',
      price: '₦6,500 / pack',
      seller: 'Mama Blessing Smokehouse',
      quarter: 'Market Road / Oja Ale',
      phone: '08134456677',
      whatsapp: '2348134456677',
      icon: '🐟',
      badge: 'fresh',
      verified: true,
      status: 'active',
      createdAt: '2026-08-22T08:30:00Z',
    },
    {
      id: 'MKT-010',
      cat: 'Crafts & Adire',
      title: 'Hand-Carved Hardwood Royal Stools & Stool Tables',
      desc: 'Handcrafted seasoned iroko and mahogany stools, traditional carvings, and durable home furniture crafted by Ogere woodmasters.',
      price: '₦45,000 / piece',
      seller: 'Ogere Master Woodcarvers',
      quarter: 'Idi-Iroko',
      phone: '08076654433',
      whatsapp: '2348076654433',
      icon: '🪚',
      badge: 'handmade',
      verified: true,
      status: 'active',
      createdAt: '2026-08-23T13:00:00Z',
    },
    {
      id: 'MKT-011',
      cat: 'Farm Produce',
      title: 'Crispy White Garri Ijebu / Ogere (Grade 1 - 50kg Bag)',
      desc: 'Expertly fermented, double-sieved white garri with the signature sour crunch. Bulk bags delivered directly from processing mills.',
      price: '₦28,000 / bag',
      seller: 'Iya Kike Garri Mills',
      quarter: 'Ago-Ogere',
      phone: '08091122334',
      whatsapp: '2348091122334',
      icon: '🌾',
      badge: 'organic',
      verified: true,
      status: 'active',
      createdAt: '2026-08-24T16:00:00Z',
    },
    {
      id: 'MKT-012',
      cat: 'Services',
      title: 'Professional House Painting & Decorative POP Screeding',
      desc: 'High quality interior and exterior painting, textured screeding, and damp-proofing for new and renovated buildings.',
      price: '₦350 / sqm',
      seller: 'Brother Femi Professional Finishes',
      quarter: 'Oke-Ogere',
      phone: '08081199223',
      whatsapp: '2348081199223',
      icon: '🎨',
      badge: 'pro',
      verified: true,
      status: 'active',
      createdAt: '2026-08-25T11:00:00Z',
    },
  ],
  scholarships: [
    {
      id: 'SCH-APP-001',
      programId: '1',
      programTitle: 'Oba Babington-Ashaye Memorial STEM Award',
      applicantName: 'Oluwaseun Adedoyin',
      compound: 'Agbejoye Compound',
      institution: 'Olabisi Onabanjo University (Computer Science, 300L)',
      email: 'oluwaseun.adedoyin@oou.edu.ng',
      phone: '08039988776',
      statement: 'Building open-source agricultural inventory tools for Ogere farmers. CGPA 4.62.',
      status: 'shortlisted',
      score: 92,
      createdAt: '2026-08-15T10:00:00Z',
    },
  ],
  blood_donors: [
    {
      id: 'BLD-001',
      name: 'Sunday Solarin',
      bloodGroup: 'O+',
      phone: '08033445566',
      location: 'Isale-Ogere',
      available: true,
      lastDonated: '2026-02-10',
      registeredAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'BLD-002',
      name: 'Kehinde Balogun',
      bloodGroup: 'O-',
      phone: '08022334455',
      location: 'Oke-Ogere',
      available: true,
      lastDonated: '2026-05-18',
      registeredAt: '2026-03-20T11:00:00Z',
    },
    {
      id: 'BLD-003',
      name: 'Amina Adeleke',
      bloodGroup: 'A+',
      phone: '08077889900',
      location: 'Ajura',
      available: true,
      lastDonated: '2025-11-30',
      registeredAt: '2025-10-12T15:30:00Z',
    },
  ],
  incident_reports: [
    {
      id: 'INC-2026-001',
      title: 'Heavy Rainfall Culvert Blockage on Market Road',
      category: 'infrastructure',
      location: 'Market Road near Oja Ale',
      severity: 'medium',
      reporterName: 'Kazeem Olayiwola',
      reporterContact: '08091234567',
      description: 'Runoff water accumulating rapidly near main stalls due to storm debris. OCDA public works intervention requested.',
      status: 'investigating',
      createdAt: '2026-08-26T09:00:00Z',
    },
  ],
  live_subscribers: [
    {
      id: 'SUB-001',
      email: 'diaspora.member@gmail.com',
      phone: '+2348030001122',
      events: ['Lipakala Day', 'Palace Thanksgiving'],
      createdAt: '2026-08-20T10:00:00Z',
    },
  ],
  pageant_registrations: [
    {
      id: 'PGN-2026-001',
      name: 'Adetoun Kikelomo Solarin',
      email: 'adetoun.solarin@gmail.com',
      phone: '08034567812',
      age: 22,
      height: "5'7\"",
      address: 'Isale-Ogere (Living in Lagos)',
      occupation: 'Undergraduate (Mass Comm)',
      reason: 'Passionate about Yoruba cultural preservation, girl-child education in Remo, and serving as a worthy cultural ambassador for Ogere Remo worldwide.',
      status: 'pending',
      submittedAt: '2026-08-20T14:00:00Z',
    },
  ],
};

// In-Memory Cache
const memoryCache = new Map();

/**
 * Initialize collection from storage or seed defaults
 */
function initCollection(collectionName) {
  if (memoryCache.has(collectionName)) {
    return memoryCache.get(collectionName);
  }

  const raw = localStorage.getItem(`${STORAGE_PREFIX}${collectionName}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      memoryCache.set(collectionName, parsed);
      return parsed;
    } catch {
      // parse failed, fallback
    }
  }

  const seed = SEED_DATA[collectionName] || [];
  memoryCache.set(collectionName, seed);
  localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(seed));
  return seed;
}

/**
 * Get all items from a collection
 */
export async function dbGetAll(collectionName) {
  return initCollection(collectionName);
}

/**
 * Get a single item by ID
 */
export async function dbGetById(collectionName, id) {
  const items = initCollection(collectionName);
  return items.find(item => item.id === id) || null;
}

/**
 * Insert or append a new item into collection
 */
export async function dbInsert(collectionName, item) {
  const items = initCollection(collectionName);
  const newItem = {
    ...item,
    id: item.id || `${collectionName.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const updated = [newItem, ...items];
  memoryCache.set(collectionName, updated);
  localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(updated));

  // Dispatch custom window event for real-time reactivity across components
  window.dispatchEvent(new CustomEvent(`db-${collectionName}-updated`, { detail: updated }));
  return newItem;
}

/**
 * Update an existing item by ID
 */
export async function dbUpdate(collectionName, id, updates) {
  const items = initCollection(collectionName);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  memoryCache.set(collectionName, items);
  localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(items));

  window.dispatchEvent(new CustomEvent(`db-${collectionName}-updated`, { detail: items }));
  return items[index];
}

/**
 * Delete an item by ID
 */
export async function dbRemove(collectionName, id) {
  const items = initCollection(collectionName);
  const updated = items.filter(item => item.id !== id);

  memoryCache.set(collectionName, updated);
  localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent(`db-${collectionName}-updated`, { detail: updated }));
  return true;
}

/**
 * Overwrite entire collection
 */
export async function dbSetCollection(collectionName, data) {
  memoryCache.set(collectionName, data);
  localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(`db-${collectionName}-updated`, { detail: data }));
  return true;
}

/**
 * Export collection data to CSV format
 */
export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
