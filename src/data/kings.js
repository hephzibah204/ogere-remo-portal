import { getWithFallback } from '../services/storage';

const STATIC_KINGS = [
  {
    n: 'Oba Adelana Osifayo',
    t: 'Legunsen I',
    e: 'c. 1880s',
    h: 'Legunsen Ruling House',
    cur: false,
    note: 'The FIRST Ologere of Ogere upon formal establishment of the town after the Yoruba Wars. He was the third Oba to have reigned at the original Agbele settlement — and became the founding Ologere as the scattered Ilagere settlements consolidated into one fortified town in the early 1880s.',
    oriki: null,
  },
  {
    n: '[Additional Kings — Legunsen II onwards]',
    t: 'Historical Record',
    e: '1880s – 1945',
    h: 'Rotating Ruling Houses',
    cur: false,
    note: 'Several Ologere reigned in succession through the early colonial period and into independence. The royal titles confirm at least Legunsen II existed before Legunsen III. Full register is preserved in the Ologere Palace Archives and the Ogun State Ministry of Chieftaincy Affairs.',
    oriki: null,
  },
  {
    n: 'Oba Alfred Obafuwa Babington-Ashaye',
    t: 'Legunsen III · Agbalajobi-Erinjogunola',
    e: 'c. 1945 – December 4, 1982',
    h: 'Legunsen Ruling House',
    cur: false,
    note: 'A patriarchal and highly respected monarch who reigned for approximately 37 years. He received a full state burial befitting his stature. His son was the late Prince Adebajo Babington-Ashaye, and his grandson is Adedeji Babington-Ashaye.',
    children: [
      'Prince Adebajo Babington-Ashaye',
      'Prince Olumuyiwa Babington-Ashaye',
      'Baba Olumuyiwa',
      'Baba Olufunmilayo',
      'Baba Tinuade',
      'Baba Ademolu',
      'Baba Ademola',
      'Baba Adebajo',
      'Baba Adegboyega',
      'Baba Aderonke',
      'Prince Adetoyinbo Babington-Ashaye',
      'Baba Adeleke',
      'Baba Tiwalade',
    ],
    oriki: `Agbalajobi-Erinjogunola, Omo Otunbade, Omo Jawo ni di agbalagba.
Oba nla to n gbadobale Oba. Omo Lipakala agbeni madein,
re folugboro oloyo poyo, o fi Ori oloyo dakere.
Omo Yemogun atatameti, elebiripo ijimiji,
ti sale ko jina, ti toke jinna,
Omo Ogere mogbo, Ogere ota, ni le onireke.
Omo itun epe, agbade sori yan gbendeke,
Omo olowo Joye Meji po, o tun reti eketa.
Omo arojojoye, adele tejiteji. Ojoye titi, o tun je sikuloye.
ojoye koye wun niije. Borokini dara dele ko to joba,
aguntaso lo, olowo ladugbo baba Tinuade.
Oko dudu, oko pupa, oko Borokini baba Ademola.
Ara Ijebu ode, Ijebu Ode-ajagbalura,
eyin lomo a fidi pote mole, alagemo merindinlogun,
Omo alagemo abijo wenewene. Omo Lagere, lagboole Iremo.
Nile Ife Odaaye ni bi ojumo ti n mo wa,
enu lo n jibo ni le baba to bi yin lomo.
Kabiyeesi alase, igbakeji orisa,
Orisa nla to n biologbo leru.
Didun ni iranti olododo...`,
  },
  {
    n: 'Oba Oladele Moshood Ogunbade',
    t: 'Agbejoye II',
    e: 'December 3, 1983 – April 10, 2022',
    h: 'Agbejoye/Fadagbuwa Ruling House',
    cur: false,
    note: 'Installed on December 3, 1983. Reigned for over 38 remarkable years. Before ascending the throne he served as Marketing Manager at the Nigerian Tobacco Company (NTC), Ibadan. Passed away on April 10, 2022 at the age of 85.',
    oriki: null,
  },
  {
    n: 'Oba James Obafemi Saliu',
    t: 'Kankanbiina II · Ilufemiloye I · Arole Olipakala',
    e: 'April 25, 2023 — Present',
    h: 'Kankanbina/Ejigboye Ruling House',
    cur: true,
    note: 'Appointed and installed on April 25, 2023; formally coronated September 23, 2023. Currently reigning. Commissioned the Aafin Ologere Palace (April 2025), the Lipakala Cultural Centre (April 2025), an FRSC office complex (April 2026), and led major community empowerment programmes.',
    oriki: null,
  },
];

export const notableDescendants = [
  {
    n: 'Dr. Shola Mos-Shogbamimu',
    r: 'Granddaughter of Oba Alfred (Legunsen III)',
    f: 'Lawyer, Author & Political Commentator (UK). PhD (Birkbeck), LLM (LSE), Executive MBA (Cambridge). New York Attorney. Founder: Women in Leadership publication.',
    note: 'Daughter of late Prince Adebajo Babington-Ashaye',
  },
  {
    n: 'Late Otunba Ademolu Babington-Ashaye',
    r: 'Son of Oba Alfred (Legunsen III)',
    f: 'Former Principal General, Remo Division, Ogun State. Distinguished administrator and community leader.',
    note: 'Father of Adedeji Babington-Ashaye',
  },
  {
    n: 'Otunba Fatai Sowemimo',
    r: 'Married into the family',
    f: 'His wife is a granddaughter of Oba Alfred through Prince Olumuyiwa Babington-Ashaye. Prominent Ogun State figure.',
    note: '',
  },
];

export const rulingHouses = [
  ['⚔️', 'Legunsen Ruling House', 'The founding royal house. Produced Legunsen I (first Ologere), Legunsen III (Oba Alfred Babington-Ashaye, 1945-1982).'],
  ['🌿', 'Agbejoye / Fadagbuwa Ruling House', 'Produced Oba Oladele Ogunbade (Agbejoye II), who reigned 1983–2022 for 38 years.'],
  ['👑', 'Kankanbina / Ejigboye Ruling House', 'Currently reigning — Oba James Obafemi Saliu (Kankanbiina II), installed April 2023.'],
  ['🏺', 'Oregunsen Ruling House', 'Fourth of the four royal houses eligible to produce the Ologere of Ogere Remo.'],
];

export const achievements = [
  { ic: '🏛️', d: 'April 2025', t: 'Commissioned Aafin Ologere — first permanent palace in Ogere\'s modern history.' },
  { ic: '🎭', d: 'April 2025', t: 'Opened Lipakala Cultural Centre — permanent home for Ogere\'s cultural heritage.' },
  { ic: '💰', d: 'April 2025', t: 'Empowerment programme — artisans received tools; 50 residents received ₦100,000 each.' },
  { ic: '⛽', d: 'Feb 2026', t: 'Welcomed TEG CNG facility — 60,000 SCMD, creating new jobs for Ogere residents.' },
  { ic: '🚦', d: 'April 2026', t: 'Donated and commissioned FRSC office complex — 3rd coronation anniversary.' },
];

export const kings = getWithFallback('cms-kings', STATIC_KINGS);
