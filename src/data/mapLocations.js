import { getWithFallback } from '../services/storage';

const STATIC_MAP_LOCATIONS = [
  { id: 'town', icon: '🏘️', cat: 'Town', color: '#C9963A', name: 'Ogere Remo (Town Centre)', address: 'Ogere, Ogun State, Nigeria', lat: 6.9371, lng: 3.6335, note: 'Ancient town founded circa 1401 A.D. by Olipakala.', phone: null, rating: null, hours: null, mapUrl: 'https://maps.google.com/?cid=11923625229733893073', placeId: 'ChIJ1fEusO7QOxAR0ZMs7fg5eaU' },
  { id: 'resort', icon: '🏨', cat: 'Hospitality', color: '#B5451B', name: 'Ogere Resort & Convention Centre', address: 'KM 67, Lagos–Ibadan Expressway, Ogere 121107', lat: 6.9388, lng: 3.6437, note: 'Nigeria\'s premier resort. 140+ rooms, Convention Centre.', phone: '+234 906 247 0474', rating: '4.4★ (558 reviews)', hours: 'Mon–Sun: 8 AM – 8 PM', website: 'ogereresort.com', mapUrl: 'https://maps.google.com/?cid=9395082246187162583', placeId: 'ChIJ6wwCMt3QOxAR15uQj4YJYoI' },
  { id: 'college', icon: '🏫', cat: 'Education', color: '#1a2e5e', name: 'Ositelu Memorial College', address: 'Awomosu Agbato Drive, Ogere 121107', lat: 6.9405, lng: 3.6397, note: 'Flagship secondary school of Ogere Remo.', phone: '+234 806 215 8840', rating: null, hours: 'Mon–Fri: 8 AM – 5 PM', mapUrl: 'https://maps.google.com/?cid=4090423021898899040', placeId: 'ChIJJfKXRz_ROxARYB5dAREaxDg' },
  { id: 'police', icon: '🚔', cat: 'Emergency', color: '#dc2626', name: 'Ogere Police Station', address: 'WJMP+W64, Ogere 121107, Ogun State', lat: 6.9348, lng: 3.6356, note: 'DPO direct line: 08081762371', phone: '+234 705 459 9009 / DPO: 08081762371', rating: null, hours: '24 Hours', mapUrl: 'https://maps.google.com/?cid=14657118965300211236', placeId: 'ChIJR3f31QvROxARJC5czQqMaMs' },
  { id: 'market', icon: '🛖', cat: 'Commerce', color: '#8B6914', name: 'Ogere Central Market', address: 'WJPM+5G6, Ogere 121107, Ogun State', lat: 6.9354, lng: 3.6338, note: 'Centuries-old commercial heart.', phone: '+234 704 957 0510', rating: '4.4★ (8 reviews)', hours: null, mapUrl: 'https://maps.google.com/?cid=10584053378168759331', placeId: 'ChIJicsFSwPROxARI6SFgXgc4pI' },
  { id: 'townhall', icon: '🏛️', cat: 'Governance', color: '#2D4A22', name: 'Ogere Town Hall (OCDA HQ)', address: 'WJPJ+GP4, Ogere 121107, Ogun State', lat: 6.9363, lng: 3.6318, note: 'Headquarters of OCDA.', phone: '+234 912 725 6487', rating: '3.7★ (15 reviews)', hours: null, mapUrl: 'https://maps.google.com/?cid=8784080297279850490', placeId: 'ChIJvwhw1vHQOxAR-offhX1S53k' },
  { id: 'aladura', icon: '⛪', cat: 'Heritage', color: '#1a2e5e', name: 'Church of the Lord (Aladura) Worldwide', address: 'WJPR+9QQ, Ogere 121107, Ogun State', lat: 6.936, lng: 3.642, note: 'Global church founded here July 27, 1930.', phone: null, rating: '4.1★ (32 reviews)', hours: null, website: 'tclpfw.org', mapUrl: 'https://maps.google.com/?cid=5298892855962817078', placeId: 'ChIJBSPA1-nQOxARNtKETvpyiUk' },
  { id: 'trailer', icon: '🚛', cat: 'Transport', color: '#5C3317', name: 'Ogere Trailer Park', address: 'WJPM+JQP, Ogere 121107, Ogun State', lat: 6.9366, lng: 3.6344, note: 'Major logistics hub on Lagos–Ibadan Expressway.', phone: '+234 912 413 0304', rating: '3.7★ (106 reviews)', hours: '24 Hours', mapUrl: 'https://maps.google.com/?cid=5053875656169541163', placeId: 'ChIJU4rihN_ROxARK876-CH5IkY' },
  { id: 'frsc', icon: '🚦', cat: 'Emergency', color: '#dc2626', name: 'FRSC — Sagamu Interchange', address: 'Lagos–Ibadan Expressway, Sagamu, Ogun State', lat: 6.8843, lng: 3.5817, note: 'Nearest confirmed FRSC post. New Ogere office commissioned April 2026.', phone: '122 (National FRSC)', rating: null, hours: '24 Hours', mapUrl: 'https://maps.google.com/?cid=14639378847379748070', placeId: 'ChIJ-6SmZwDbOxAR5vRvun-FKcs' },
];

export const MAP_LOCATIONS = getWithFallback('cms-maplocations', STATIC_MAP_LOCATIONS);

export const CAT_COLORS = {
  Town: '#C9963A', Hospitality: '#B5451B', Education: '#1a2e5e',
  Emergency: '#dc2626', Commerce: '#8B6914', Governance: '#2D4A22',
  Heritage: '#1a4a2e', Transport: '#5C3317',
};
