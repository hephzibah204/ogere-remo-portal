import { dbGet, dbSet, dbDelete } from './storage';

const CONTENT_TYPES = {
  kings: {
    label: 'Kings', icon: '👑', key: 'cms-kings',
    fields: [
      { k: 'n', l: 'Name', t: 'text', r: true },
      { k: 't', l: 'Title', t: 'text' },
      { k: 'e', l: 'Era', t: 'text' },
      { k: 'h', l: 'Ruling House', t: 'text' },
      { k: 'cur', l: 'Currently Reigning', t: 'bool' },
      { k: 'note', l: 'Notes', t: 'textarea' },
      { k: 'oriki', l: 'Oriki (Praise Poetry)', t: 'textarea' },
      { k: 'children', l: 'Children', t: 'list' },
    ],
    list: ['n', 't', 'e'],
  },
  gallery: {
    label: 'Gallery', icon: '🖼️', key: 'cms-gallery',
    fields: [
      { k: 'cat', l: 'Category', t: 'select', o: ['coronation', 'palace', 'lipakala', 'development', 'heritage', 'diaspora'] },
      { k: 'title', l: 'Title', t: 'text', r: true },
      { k: 'date', l: 'Date', t: 'text' },
      { k: 'desc', l: 'Description', t: 'textarea' },
      { k: 'src', l: 'Image URL', t: 'url' },
      { k: 'credit', l: 'Credit', t: 'text' },
      { k: 'icon', l: 'Icon', t: 'emoji' },
      { k: 'bg', l: 'Background Gradient', t: 'text' },
    ],
    list: ['title', 'cat', 'date'],
  },
  news: {
    label: 'News', icon: '📰', key: 'cms-news',
    fields: [
      { k: 'id', l: 'ID', t: 'text', r: true },
      { k: 'date', l: 'Date', t: 'text' },
      { k: 'cat', l: 'Category', t: 'select', o: ['development', 'royal', 'community', 'infrastructure', 'culture', 'diaspora'] },
      { k: 'headline', l: 'Headline', t: 'text', r: true },
      { k: 'body', l: 'Body', t: 'textarea' },
      { k: 'ic', l: 'Icon', t: 'emoji' },
    ],
    list: ['headline', 'date', 'cat'],
  },
  events: {
    label: 'Events', icon: '📅', key: 'cms-events',
    fields: [
      { k: 'title', l: 'Title', t: 'text', r: true },
      { k: 'date', l: 'Date', t: 'text' },
      { k: 'time', l: 'Time', t: 'text' },
      { k: 'venue', l: 'Venue', t: 'text' },
      { k: 'desc', l: 'Description', t: 'textarea' },
      { k: 'cat', l: 'Category', t: 'select', o: ['festival', 'royal', 'traditional', 'community'] },
      { k: 'status', l: 'Status', t: 'select', o: ['upcoming', 'completed'] },
      { k: 'organiser', l: 'Organiser', t: 'text' },
    ],
    list: ['title', 'date', 'status'],
  },
  diasporaNotable: {
    label: 'Notable Diaspora', icon: '🌟', key: 'cms-diaspora-notable',
    fields: [
      { k: 'n', l: 'Name', t: 'text', r: true },
      { k: 'l', l: 'Location', t: 'text' },
      { k: 'f', l: 'Field/Profession', t: 'text' },
      { k: 'note', l: 'Notes', t: 'textarea' },
      { k: 'ic', l: 'Icon', t: 'emoji' },
    ],
    list: ['n', 'l', 'f'],
  },
  diasporaGroups: {
    label: 'Diaspora Groups', icon: '🤝', key: 'cms-diaspora-groups',
    fields: [
      { k: 'n', l: 'Group Name', t: 'text', r: true },
      { k: 'd', l: 'Description', t: 'textarea' },
      { k: 'ct', l: 'Contact', t: 'text' },
    ],
    list: ['n', 'ct'],
  },
  blog: {
    label: 'Blog Posts', icon: '📝', key: 'cms-blog',
    fields: [
      { k: 'title', l: 'Title', t: 'text', r: true },
      { k: 'slug', l: 'URL Slug', t: 'text', r: true },
      { k: 'body', l: 'Content', t: 'richtext', r: true },
      { k: 'excerpt', l: 'Excerpt', t: 'textarea' },
      { k: 'featuredImage', l: 'Featured Image', t: 'url' },
      { k: 'categories', l: 'Categories', t: 'list' },
      { k: 'tags', l: 'Tags', t: 'list' },
      { k: 'author', l: 'Author', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', o: ['draft', 'published', 'scheduled'] },
      { k: 'publishDate', l: 'Publish Date', t: 'text' },
    ],
    list: ['title', 'author', 'status'],
  },
  mapLocations: {
    label: 'Map Locations', icon: '🗺️', key: 'cms-maplocations',
    fields: [
      { k: 'id', l: 'ID', t: 'text', r: true },
      { k: 'name', l: 'Name', t: 'text', r: true },
      { k: 'cat', l: 'Category', t: 'select', o: ['Town', 'Hospitality', 'Education', 'Emergency', 'Commerce', 'Governance', 'Heritage', 'Transport'] },
      { k: 'icon', l: 'Icon', t: 'emoji' },
      { k: 'color', l: 'Color', t: 'color' },
      { k: 'address', l: 'Address', t: 'text' },
      { k: 'lat', l: 'Latitude', t: 'number' },
      { k: 'lng', l: 'Longitude', t: 'number' },
      { k: 'note', l: 'Notes', t: 'textarea' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'rating', l: 'Rating', t: 'text' },
      { k: 'hours', l: 'Hours', t: 'text' },
      { k: 'website', l: 'Website', t: 'url' },
    ],
    list: ['name', 'cat', 'address'],
  },
  pages: {
    label: 'Custom Pages', icon: '📄', key: 'cms-pages',
    fields: [
      { k: 'title', l: 'Page Title', t: 'text', r: true },
      { k: 'slug', l: 'URL Slug', t: 'text', r: true },
      { k: 'status', l: 'Status', t: 'select', o: ['draft', 'published'] },
      { k: 'data', l: 'Puck Layout Data', t: 'json' },
    ],
    list: ['title', 'slug', 'status'],
  },
};

const SUBMISSION_TYPES = {
  biz: {
    label: 'Business Listings', icon: '🏪', key: 'biz',
    fields: [
      { k: 'name', l: 'Business Name', t: 'text', r: true },
      { k: 'category', l: 'Category', t: 'text', r: true },
      { k: 'tier', l: 'Tier', t: 'select', o: ['Standard', 'Premium'], r: true },
      { k: 'image', l: 'Business Image (URL)', t: 'url' },
      { k: 'address', l: 'Address', t: 'text' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'email', l: 'Email', t: 'text' },
      { k: 'desc', l: 'Description', t: 'textarea' },
      { k: 'owner', l: 'Owner', t: 'text' },
      { k: 'website', l: 'Website', t: 'url' },
      { k: 'status', l: 'Status', t: 'select', o: ['pending', 'approved'] },
      { k: 'submitted', l: 'Submitted', t: 'text' },
    ],
    list: ['name', 'category', 'tier', 'status'],
  },
  suggestions: {
    label: 'Suggestions', icon: '💡', key: 'suggestions',
    fields: [
      { k: 'name', l: 'Name', t: 'text' },
      { k: 'topic', l: 'Topic', t: 'select', o: ['Heritage', 'Tourism', 'Business', 'Events', 'Other'] },
      { k: 'message', l: 'Suggestion', t: 'textarea', r: true },
      { k: 'date', l: 'Date', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', o: ['New', 'Reviewed', 'Archived'] },
    ],
    list: ['topic', 'message', 'date'],
  },
  msgs: {
    label: 'Contact Messages', icon: '✉️', key: 'msgs',
    fields: [
      { k: 'name', l: 'Name', t: 'text' },
      { k: 'email', l: 'Email', t: 'text' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'subject', l: 'Subject', t: 'text' },
      { k: 'message', l: 'Message', t: 'textarea' },
      { k: 'date', l: 'Date', t: 'text' },
    ],
    list: ['name', 'subject', 'date'],
  },
  forum: {
    label: 'Forum Posts', icon: '💬', key: 'forum',
    fields: [
      { k: 'name', l: 'Author', t: 'text' },
      { k: 'topic', l: 'Topic', t: 'text' },
      { k: 'body', l: 'Body', t: 'textarea' },
      { k: 'cat', l: 'Category', t: 'text' },
      { k: 'date', l: 'Date', t: 'text' },
    ],
    list: ['topic', 'name', 'date'],
  },
  assoc: {
    label: 'Association Regs', icon: '📋', key: 'assoc',
    fields: [
      { k: 'name', l: 'Org Name', t: 'text' },
      { k: 'type', l: 'Type', t: 'text' },
      { k: 'contact', l: 'Contact Person', t: 'text' },
      { k: 'email', l: 'Email', t: 'text' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'desc', l: 'Description', t: 'textarea' },
      { k: 'leader', l: 'Leader', t: 'text' },
      { k: 'date', l: 'Date', t: 'text' },
      { k: 'status', l: 'Status', t: 'text' },
    ],
    list: ['name', 'contact', 'status'],
  },
  idCards: {
    label: 'ID Cards Queue', icon: '🪪', key: 'id_cards',
    fields: [
      { k: 'id', l: 'Card ID', t: 'text', r: true },
      { k: 'fullName', l: 'Full Name', t: 'text', r: true },
      { k: 'cardType', l: 'Classification', t: 'select', o: ['indigene', 'resident', 'diaspora', 'honorary'] },
      { k: 'compound', l: 'Ancestral Compound', t: 'text' },
      { k: 'quarter', l: 'Quarter', t: 'text' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'status', l: 'Approval Status', t: 'select', o: ['approved', 'pending', 'rejected'] },
      { k: 'issuedDate', l: 'Issue Date', t: 'text' },
      { k: 'expiryDate', l: 'Expiry Date', t: 'text' },
    ],
    list: ['id', 'fullName', 'cardType', 'quarter', 'status'],
  },
  royalAudiences: {
    label: 'Royal Audiences', icon: '👑', key: 'royal_audiences',
    fields: [
      { k: 'id', l: 'Appointment ID', t: 'text', r: true },
      { k: 'fullName', l: 'Applicant Name', t: 'text', r: true },
      { k: 'purpose', l: 'Audience Purpose', t: 'text' },
      { k: 'date', l: 'Scheduled Date', t: 'text' },
      { k: 'time', l: 'Time Slot', t: 'text' },
      { k: 'phone', l: 'Phone', t: 'text' },
      { k: 'groupSize', l: 'Party Size', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', o: ['confirmed', 'pending', 'cancelled'] },
      { k: 'notes', l: 'Palace Notes', t: 'textarea' },
    ],
    list: ['id', 'fullName', 'purpose', 'date', 'status'],
  },
  landRegistry: {
    label: 'Land Registry', icon: '📜', key: 'land_registry',
    fields: [
      { k: 'id', l: 'Plot ID', t: 'text', r: true },
      { k: 'area', l: 'Location / Sector', t: 'text', r: true },
      { k: 'owner', l: 'Registered Owner / Family', t: 'text', r: true },
      { k: 'size', l: 'Dimensions', t: 'text' },
      { k: 'use', l: 'Land Use', t: 'select', o: ['Residential', 'Agricultural', 'Commercial', 'Mixed Use', 'Educational'] },
      { k: 'status', l: 'Verification Status', t: 'select', o: ['Verified', 'Pending Survey', 'Disputed'] },
      { k: 'coord', l: 'Coordinates', t: 'text' },
      { k: 'documents', l: 'Survey / Gazette Docs', t: 'textarea' },
    ],
    list: ['id', 'area', 'owner', 'status', 'size'],
  },
  scholarships: {
    label: 'Scholarship Review', icon: '🎓', key: 'scholarships',
    fields: [
      { k: 'id', l: 'App ID', t: 'text', r: true },
      { k: 'programTitle', l: 'Scholarship Award', t: 'text', r: true },
      { k: 'applicantName', l: 'Student Name', t: 'text', r: true },
      { k: 'compound', l: 'Compound', t: 'text' },
      { k: 'institution', l: 'Institution / Level', t: 'text' },
      { k: 'statement', l: 'Personal Statement', t: 'textarea' },
      { k: 'status', l: 'Review Status', t: 'select', o: ['shortlisted', 'pending', 'approved', 'rejected'] },
      { k: 'score', l: 'Review Score', t: 'number' },
    ],
    list: ['applicantName', 'programTitle', 'institution', 'status'],
  },
  bloodDonors: {
    label: 'Blood Donors', icon: '🩸', key: 'blood_donors',
    fields: [
      { k: 'id', l: 'Donor ID', t: 'text', r: true },
      { k: 'name', l: 'Donor Name', t: 'text', r: true },
      { k: 'bloodGroup', l: 'Blood Group', t: 'select', o: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
      { k: 'phone', l: 'Phone Number', t: 'text', r: true },
      { k: 'location', l: 'Quarter / Location', t: 'text' },
      { k: 'available', l: 'Available For Emergency', t: 'bool' },
    ],
    list: ['name', 'bloodGroup', 'phone', 'location'],
  },
  marketplaceAdmin: {
    label: 'Marketplace Listings', icon: '🛒', key: 'marketplace',
    fields: [
      { k: 'id', l: 'Listing ID', t: 'text', r: true },
      { k: 'title', l: 'Product / Service Title', t: 'text', r: true },
      { k: 'cat', l: 'Category', t: 'select', o: ['Farm Produce', 'Crafts & Adire', 'Food & Catering', 'Services', 'Trade & Retail', 'Property'] },
      { k: 'price', l: 'Price', t: 'text' },
      { k: 'seller', l: 'Seller Name', t: 'text' },
      { k: 'phone', l: 'Phone Number', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', o: ['active', 'pending', 'sold', 'removed'] },
    ],
    list: ['title', 'cat', 'price', 'seller', 'status'],
  },
  incidentReports: {
    label: 'Incident Reports', icon: '🚨', key: 'incident_reports',
    fields: [
      { k: 'id', l: 'Report ID', t: 'text', r: true },
      { k: 'title', l: 'Incident Heading', t: 'text', r: true },
      { k: 'category', l: 'Incident Category', t: 'text' },
      { k: 'location', l: 'Incident Location', t: 'text' },
      { k: 'severity', l: 'Severity Level', t: 'select', o: ['critical', 'high', 'medium', 'low'] },
      { k: 'description', l: 'Full Description', t: 'textarea' },
      { k: 'reporterContact', l: 'Reporter Contact', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', o: ['investigating', 'pending_review', 'resolved', 'dismissed'] },
    ],
    list: ['id', 'title', 'location', 'severity', 'status'],
  },
  pageantRegistrations: {
    label: 'Miss Olipakala Contestants', icon: '👑', key: 'pageant_registrations',
    fields: [
      { k: 'id', l: 'Reg ID', t: 'text', r: true },
      { k: 'name', l: 'Contestant Name', t: 'text', r: true },
      { k: 'age', l: 'Age', t: 'number' },
      { k: 'phone', l: 'Phone Number', t: 'text', r: true },
      { k: 'email', l: 'Email Address', t: 'text' },
      { k: 'height', l: 'Height', t: 'text' },
      { k: 'address', l: 'Address / Quarter', t: 'text' },
      { k: 'occupation', l: 'Occupation / School', t: 'text' },
      { k: 'reason', l: 'Motivation / Bio', t: 'textarea' },
      { k: 'status', l: 'Status', t: 'select', o: ['pending', 'shortlisted', 'accepted', 'declined'] },
    ],
    list: ['name', 'age', 'phone', 'status'],
  },
};

export function getContentTypes() {
  return { ...CONTENT_TYPES, ...SUBMISSION_TYPES };
}

export function isSubmissionType(type) {
  return type in SUBMISSION_TYPES;
}

export async function loadItems(type) {
  const def = CONTENT_TYPES[type] || SUBMISSION_TYPES[type];
  if (!def) return [];
  const data = await dbGet(def.key);
  return data || [];
}

export async function saveItems(type, items) {
  const def = CONTENT_TYPES[type] || SUBMISSION_TYPES[type];
  if (!def) return false;
  return await dbSet(def.key, items);
}

export async function addItem(type, item) {
  const items = await loadItems(type);
  items.push(item);
  return await saveItems(type, items);
}

export async function updateItem(type, index, item) {
  const items = await loadItems(type);
  if (index < 0 || index >= items.length) return false;
  items[index] = item;
  return await saveItems(type, items);
}

export async function deleteItem(type, index) {
  const items = await loadItems(type);
  if (index < 0 || index >= items.length) return false;
  items.splice(index, 1);
  return await saveItems(type, items);
}

export async function deleteMultiple(type, indices) {
  const items = await loadItems(type);
  const sorted = [...indices].sort((a, b) => b - a);
  for (const i of sorted) {
    if (i >= 0 && i < items.length) items.splice(i, 1);
  }
  return await saveItems(type, items);
}

export async function moveItem(type, from, to) {
  const items = await loadItems(type);
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return false;
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
  return await saveItems(type, items);
}

export async function getItem(type, index) {
  const items = await loadItems(type);
  if (index < 0 || index >= items.length) return null;
  return items[index];
}

export async function getStats() {
  const stats = {};
  for (const [type, def] of Object.entries(CONTENT_TYPES)) {
    const items = await dbGet(def.key);
    stats[type] = { label: def.label, icon: def.icon, count: items ? items.length : 0 };
  }
  for (const [type, def] of Object.entries(SUBMISSION_TYPES)) {
    const items = await dbGet(def.key);
    stats[type] = { label: def.label, icon: def.icon, count: items ? items.length : 0 };
  }
  return stats;
}

export async function importDefaults(type, defaultData) {
  const def = CONTENT_TYPES[type];
  if (!def) return false;
  const existing = await dbGet(def.key);
  if (existing && existing.length > 0) return false;
  return await dbSet(def.key, defaultData);
}

export async function searchAll(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results = [];
  for (const [type, def] of Object.entries({ ...CONTENT_TYPES, ...SUBMISSION_TYPES })) {
    const items = await dbGet(def.key);
    if (!items) continue;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let matched = false;
      for (const val of Object.values(item)) {
        if (String(val || '').toLowerCase().includes(q)) { matched = true; break; }
      }
      if (matched) {
        const labelField = def.list[0];
        results.push({
          type, typeLabel: def.label, typeIcon: def.icon,
          index: i, label: String(item[labelField] || item.name || item.title || item.topic || `#${i + 1}`).substring(0, 80),
          item,
        });
      }
    }
  }
  results.sort((a, b) => a.type.localeCompare(b.type));
  return results;
}

export async function getMedia() {
  return (await dbGet('cms-media')) || [];
}

export async function addMedia(entry) {
  const media = await getMedia();
  media.push({ ...entry, id: Date.now().toString(36), added: new Date().toISOString() });
  return await dbSet('cms-media', media);
}

export async function deleteMedia(id) {
  let media = await getMedia();
  media = media.filter(m => m.id !== id);
  return await dbSet('cms-media', media);
}

export async function getAuditLog() {
  return (await dbGet('cms-audit')) || [];
}

export async function addAuditLog(entry) {
  const log = await getAuditLog();
  log.unshift({ ...entry, ts: new Date().toISOString(), id: Date.now().toString(36) });
  if (log.length > 200) log.length = 200;
  return await dbSet('cms-audit', log);
}

export async function clearAuditLog() {
  return await dbSet('cms-audit', []);
}

/* ─── User Management ─── */
const DEFAULT_ADMIN = { id: 'admin', username: 'admin', password: 'ogere2026', role: 'admin', name: 'Administrator', created: new Date().toISOString() };

export async function getUsers() {
  let users = await dbGet('cms-users');
  if (!users || users.length === 0) {
    users = [DEFAULT_ADMIN];
    await dbSet('cms-users', users);
  }
  return users;
}

export async function addUser(user) {
  const users = await getUsers();
  if (users.find(u => u.username === user.username)) return false;
  users.push({ ...user, id: Date.now().toString(36), created: new Date().toISOString() });
  return await dbSet('cms-users', users);
}

export async function updateUser(id, updates) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0) return false;
  users[idx] = { ...users[idx], ...updates };
  return await dbSet('cms-users', users);
}

export async function deleteUser(id) {
  if (id === 'admin') return false;
  let users = await getUsers();
  users = users.filter(u => u.id !== id);
  return await dbSet('cms-users', users);
}

export async function authenticateUser(username, password) {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

/* ─── SEO defaults ─── */
export const SITE_DEFAULTS = {
  title: 'Ogere Remo Community Portal',
  description: 'Official community portal of Ogere Remo — Ancient town in Ogun State, Nigeria, founded circa 1401 A.D. Discover the history, monarchy, culture, and people of Ogere Remo.',
  url: 'https://ogereremo.ng',
  image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&q=80',
  twitter: '@OgereRemo',
};
