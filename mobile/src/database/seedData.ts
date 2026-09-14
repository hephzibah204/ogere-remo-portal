export interface SeedNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  isBreaking?: boolean;
  author: string;
}

export interface SeedKingItem {
  name: string;
  title: string;
  era: string;
  house: string;
  isCurrent: boolean;
  note: string;
  oriki?: string;
}

export interface SeedBusinessItem {
  id: string;
  name: string;
  category: string;
  tier: string;
  description: string;
  phone: string;
  address: string;
  rating: string;
}

export interface SeedEmergencyContact {
  id: string;
  service: string;
  phone: string;
  location: string;
  availableHours: string;
  icon: string;
}

export const SEED_NEWS: SeedNewsItem[] = [
  {
    id: 'news-01',
    title: 'HRH Oba James Obafemi Saliu Commissioned Ultra-Modern Aafin Ologere Palace',
    category: 'Palace Proclamation',
    date: '2025-04-18',
    readTime: '4 min read',
    isBreaking: true,
    author: 'Royal Palace Media Secretariat',
    summary: 'A landmark achievement in Ogere Remo modern history as the first permanent royal palace was officially dedicated.',
    content: `In a historic gathering of Remo monarchs, state dignitaries, and indigenes from around the world, His Royal Majesty Oba James Obafemi Saliu (Kankanbiina II, Ilufemiloye I, Arole Olipakala) formally commissioned the permanent Aafin Ologere Palace. 

The royal complex features council chambers for traditional chiefs, a modern civic reception auditorium, archival royal library, and administrative suites for community welfare administration.

Kabiyesi expressed deep gratitude to all donors, diaspora champions, and community development committees who contributed tirelessly toward realizing this monumental architectural pride of Ogere Remo.`
  },
  {
    id: 'news-02',
    title: 'TEG Compressed Natural Gas (CNG) Facility Launches in Ogere Industrial Corridor',
    category: 'Economy & Jobs',
    date: '2026-02-12',
    readTime: '3 min read',
    isBreaking: false,
    author: 'Ogere Economic Development Desk',
    summary: 'A new 60,000 SCMD green energy plant creates over 150 direct and indirect employment positions for local youth.',
    content: `Ogere Remo reinforces its strategic status as the logistics nexus along the Lagos–Ibadan Expressway corridor with the official operational commissioning of the TEG CNG Mother Station.

The project not only supports cleaner commercial transportation across southwestern Nigeria, but guarantees youth apprenticeship quotas and local engineering vendor empowerment through the Ogere Community Development Association agreement.`
  },
  {
    id: 'news-03',
    title: 'Annual Olipakala Cultural Festival Dates Announced: A Celebration of Unity',
    category: 'Culture & Heritage',
    date: '2026-06-05',
    readTime: '3 min read',
    isBreaking: false,
    author: 'Lipakala Heritage Council',
    summary: 'Cultural troupes, diaspora homecoming rites, traditional wrestling, and the Miss Olipakala pageant return this November.',
    content: `The Lipakala Cultural Committee has announced the schedule for the 2026 Olipakala Cultural Festival. 

Key events include the traditional royal procession from Kankanbina through Oke-Ogere and Isale-Ogere, the Agbele Ancestral Pilgrimage, youth football tournaments, and the grand coronation ball of the 2026 Miss Olipakala cultural queen.`
  },
  {
    id: 'news-04',
    title: 'Digital Community ID Card Registration Launched for All Indigenes and Residents',
    category: 'Civic Services',
    date: '2026-01-10',
    readTime: '2 min read',
    isBreaking: false,
    author: 'Civic Transformation Taskforce',
    summary: 'Verify ancestry, secure community access, and enjoy discounted services with the unified Digital ID.',
    content: `The Palace of the Ologere and the Ogere Central Council have officially unveiled the digital identity framework.

Every registered indigene, resident, and diaspora member can now obtain a cryptographic Digital ID Card with QR verification. The card entitles holders to civic representation, palace grants, and expedited community documentation.`
  },
  {
    id: 'news-05',
    title: 'Ogere Remo Free Medical Outreach & Blood Donation Drive Exceeds Target',
    category: 'Health & Welfare',
    date: '2026-03-22',
    readTime: '3 min read',
    isBreaking: false,
    author: 'Ogere Health Mission',
    summary: 'Over 850 residents received comprehensive health screenings, medications, and eyeglasses in collaboration with diaspora doctors.',
    content: `The Ogere General Hospital and Diaspora Medical Association successfully concluded a 3-day health mission across all 5 community quarters. Free consultations for hypertension, diabetes, vision care, and pediatric vaccinations were administered seamlessly.`
  }
];

export const SEED_KINGS: SeedKingItem[] = [
  {
    name: 'Oba James Obafemi Saliu',
    title: 'Kankanbiina II · Ilufemiloye I · Arole Olipakala',
    era: 'April 25, 2023 — Present',
    house: 'Kankanbina / Ejigboye Ruling House',
    isCurrent: true,
    note: 'Currently reigning. Commissioned the Aafin Ologere Palace (2025), Lipakala Cultural Centre, and spearheaded modern community civic transformations.',
    oriki: 'Kabiyesi Ologere ti Ogere Remo! Omo Lipakala agbeni madein, Arole Olipakala, Omo Ogere mogbo, Ogere ota, ni le onireke.'
  },
  {
    name: 'Oba Oladele Moshood Ogunbade',
    title: 'Agbejoye II',
    era: 'December 3, 1983 – April 10, 2022',
    house: 'Agbejoye / Fadagbuwa Ruling House',
    isCurrent: false,
    note: 'Reigned for over 38 transformative years. Formerly Marketing Manager at Nigerian Tobacco Company (NTC). Oversaw major educational developments in Ogere Remo.',
  },
  {
    name: 'Oba Alfred Obafuwa Babington-Ashaye',
    title: 'Legunsen III · Agbalajobi-Erinjogunola',
    era: 'c. 1945 – December 4, 1982',
    house: 'Legunsen Ruling House',
    isCurrent: false,
    note: 'Patriarchal and revered monarch who reigned for 37 years. Received full state honours and led community consolidation across post-independence Nigeria.',
    oriki: 'Agbalajobi-Erinjogunola, Omo Otunbade, Oba nla to n gbadobale Oba. Omo Lipakala agbeni madein, Omo Ogere mogbo, Ogere ota.'
  },
  {
    name: 'Oba Adelana Osifayo',
    title: 'Legunsen I',
    era: 'c. 1880s',
    house: 'Legunsen Ruling House',
    isCurrent: false,
    note: 'The founding Ologere of Ogere upon the formal establishment and fortification of the town following the historic Yoruba Wars.',
  }
];

export const SEED_BUSINESSES: SeedBusinessItem[] = [
  {
    id: 'biz_hephzibah',
    name: 'Hephzibah Edutech & Innovation Hub',
    category: 'Technology & Education',
    tier: 'Premium',
    description: 'Digital innovation hub offering software bootcamps, AI training, coding, and STEM certification in Ogere Remo.',
    phone: '+234 803 892 0110',
    address: 'Innovation Campus, Palace Way / Expressway Axis, Ogere',
    rating: '5.0★'
  },
  {
    id: 'biz1',
    name: 'Ogere Resort & Convention Centre',
    category: 'Hospitality & Tourism',
    tier: 'Premium',
    description: 'Premier retreat destination with 140+ luxury chalets, recreational pools, and conference auditoriums.',
    phone: '+234 906 247 0474',
    address: 'KM 67, Lagos–Ibadan Expressway, Ogere Remo',
    rating: '4.4★'
  },
  {
    id: 'biz2',
    name: 'Ositelu Memorial College (OMCOOSA)',
    category: 'Education',
    tier: 'Standard',
    description: 'Flagship secondary educational institution of Ogere Remo, preserving academic excellence.',
    phone: '+234 806 215 8840',
    address: 'Awomosu Agbato Drive, Ogere 121107',
    rating: '4.8★'
  },
  {
    id: 'biz3',
    name: 'Ogere Central Agro-Allied Logistics',
    category: 'Agriculture & Trade',
    tier: 'Verified',
    description: 'Wholesale agricultural farm produce distribution, poultry processing, and haulage services.',
    phone: '+234 802 334 9911',
    address: 'Oke-Ogere Market Complex, Ogere',
    rating: '4.7★'
  }
];

export const SEED_EMERGENCY: SeedEmergencyContact[] = [
  {
    id: 'em-1',
    service: 'Ogere Police Divisional Headquarters',
    phone: '08034567890',
    location: 'Palace Way, Ogere Remo',
    availableHours: '24/7 Rapid Response',
    icon: 'ShieldAlert'
  },
  {
    id: 'em-2',
    service: 'FRSC Expressway Patrol Unit (RS2.2)',
    phone: '122',
    location: 'KM 66 Lagos–Ibadan Expressway, Ogere Outpost',
    availableHours: '24/7 Highway Rescue',
    icon: 'Ambulance'
  },
  {
    id: 'em-3',
    service: 'Ogere Comprehensive Primary Health Centre',
    phone: '08123456781',
    location: 'Isale-Ogere Hospital Road',
    availableHours: '24 Hours Emergency Ward',
    icon: 'Cross'
  },
  {
    id: 'em-4',
    service: 'Palace of the Ologere Emergency Secretariat',
    phone: '08023456789',
    location: 'Aafin Ologere, Ogere Remo',
    availableHours: '8:00 AM — 8:00 PM',
    icon: 'Landmark'
  }
];
