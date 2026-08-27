import { getWithFallback } from '../services/storage';

const EVENTS_DEFAULTS = [
  { title: '49th Lipakala Day — Ogere Remo', date: 'October 2025', time: 'All Day', venue: 'Wesley School Playground, Ogere Remo', desc: 'Annual flagship community festival honouring founding ancestor Olipakala.', cat: 'festival', status: 'completed', organiser: 'OCDA' },
  { title: '3rd Coronation Anniversary — Ologere', date: 'April 25, 2026', time: '10:00 AM', venue: 'Ologere Palace, Ogere Remo', desc: 'Third anniversary of Oba James Obafemi Saliu\'s installation.', cat: 'royal', status: 'completed', organiser: 'Ologere-in-Council' },
  { title: 'Oro Festival (Isemo/Oro)', date: 'July 2026', time: 'Evening/Night', venue: 'Ogere Town — Various Sacred Sites', desc: 'Annual patriarchal nocturnal festival. Movement restrictions apply.', cat: 'traditional', status: 'upcoming', organiser: 'Traditional Council' },
  { title: 'Obalufon Festival', date: 'October 2026', time: 'TBC', venue: 'Yemogun Grove (Igbo Yeye), Ogere Remo', desc: 'Annual festival honouring Yemogun — companion of Olipakala.', cat: 'traditional', status: 'upcoming', organiser: 'Traditional Council' },
  { title: '50th Lipakala Day — Golden Jubilee', date: 'October/November 2026', time: 'TBC', venue: 'Ogere Remo', desc: 'The landmark 50th edition of Lipakala Day — the Golden Jubilee.', cat: 'festival', status: 'upcoming', organiser: 'OCDA' },
  { title: 'Community Clean-Up Exercise', date: 'June 7, 2026', time: '8:00 AM', venue: 'Ogere Town Centre', desc: 'Community-wide clean-up ahead of the rainy season.', cat: 'community', status: 'upcoming', organiser: 'OCDA' },
];

export const STATIC_EVENTS = getWithFallback('cms-events', EVENTS_DEFAULTS);

export const eventCatColor = { festival: '#8B6914', royal: '#7A2E0E', traditional: '#1a2e5e', community: '#2D4A22' };
