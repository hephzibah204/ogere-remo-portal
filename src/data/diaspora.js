import { getWithFallback } from '../services/storage';

const STATIC_NOTABLE = [
  { n: 'Dr. Shola Mos-Shogbamimu', l: 'London, UK', f: 'Lawyer · Author · Political Commentator', note: 'Granddaughter of Oba Alfred Obafuwa Babington-Ashaye (Legunsen III). PhD (Birkbeck), LLM (LSE), Exec MBA (Cambridge).', ic: '🌟' },
  { n: 'David Alaba (by heritage)', l: 'Vienna, Austria / Madrid, Spain', f: 'Professional Footballer · Real Madrid Defender', note: 'Born to a Nigerian father (George Alaba) of Ogere Remo heritage. Donated mobile toilet facilities to Ogere Remo community (2022).', ic: '⚽', img: '/images/david-alaba.jpg' },
  { n: 'Late Otunba Ademolu Babington-Ashaye', l: 'Ogun State, Nigeria', f: 'Former Principal General, Remo Division', note: 'Son of the late Oba Alfred Obafuwa Babington-Ashaye (Legunsen III). Distinguished administrator.', ic: '🌟' },
];

const STATIC_REGIONS = [
  { ic: '🇬🇧', c: 'United Kingdom', d: 'London and cities across UK' },
  { ic: '🇺🇸', c: 'United States', d: 'New York, Houston, Atlanta' },
  { ic: '🇦🇹', c: 'Austria / Europe', d: 'Vienna and European cities' },
  { ic: '🇳🇬', c: 'Lagos & Abuja', d: 'Major Nigerian cities' },
  { ic: '🌍', c: 'West Africa', d: 'Ghana, Côte d\'Ivoire and more' },
  { ic: '🌐', c: 'Global', d: 'Wherever you are, you\'re home' },
];

const STATIC_DIASPORA_GROUPS = [
  { n: 'Lagos Forum of Ogere Indigenes', d: 'Principal diaspora association in Lagos. Organised \'Evening with the Ologere\' at Ikeja Business Club.', ct: 'info@ogereremo.ng' },
  { n: 'OMCOOSA UK/International', d: 'International chapters of Ositelu Memorial College Old Students\' Association.', ct: 'awobajoolakunle@gmail.com' },
  { n: 'Ogere Youth Development Association', d: 'Connects Ogere youth at home and abroad.', ct: 'oydaogere@gmail.com' },
  { n: 'Register Your Own Group', d: 'Is there an Ogere diaspora group in your city? Contact us to be listed.', ct: 'info@ogereremo.ng' },
];

export const notable = getWithFallback('cms-diaspora-notable', STATIC_NOTABLE);
export const regions = STATIC_REGIONS;
export const diasporaGroups = getWithFallback('cms-diaspora-groups', STATIC_DIASPORA_GROUPS);
