/**
 * OGERE REMO CMS — Complete Database Schema Documentation
 *
 * All data is stored in the browser's localStorage under the prefix "ogere-".
 * This file documents every data model, its shape, storage key, and relationships.
 *
 * ─── Storage Engine ───
 *   Type:       localStorage (browser)
 *   Prefix:     ogere-
 *   Access:     src/services/storage.js (dbGet, dbSet, dbDelete)
 *   Fallback:   src/services/storage.js (getWithFallback)
 *
 * ─── Schema Overview ───
 *
 *   CONTENT (managed via CMS admin):
 *     ogere-cms-kings            → King[]
 *     ogere-cms-gallery          → GalleryPhoto[]
 *     ogere-cms-news             → NewsArticle[]
 *     ogere-cms-events           → Event[]
 *     ogere-cms-diaspora-notable → NotablePerson[]
 *     ogere-cms-diaspora-groups  → DiasporaGroup[]
 *     ogere-cms-maplocations     → MapLocation[]
 *     ogere-cms-blog             → BlogPost[]
 *     ogere-cms-media            → MediaItem[]
 *     ogere-cms-audit            → AuditEntry[]
 *
 *   USERS (admin/editor CMS accounts):
 *     ogere-cms-users            → CmsUser[]
 *
 *   SUBMISSIONS (user-submitted content):
 *     ogere-biz                  → BusinessSubmission[]
 *     ogere-msgs                 → ContactMessage[]
 *     ogere-forum                → ForumPost[]
 *     ogere-assoc                → AssociationSubmission[]
 *
 *   COMMUNITY (site user accounts):
 *     ogere-users                → SiteUser[]
 *     ogere-session              → { userId: string }
 *
 * ========================================================================
 *  1. CONTENT MODELS
 * ========================================================================
 */

/** 👑 King */
export const KingSchema = {
  storageKey: 'cms-kings',
  fields: {
    n: { type: 'string', label: 'Name', required: true },
    t: { type: 'string', label: 'Title' },
    e: { type: 'string', label: 'Era' },
    h: { type: 'string', label: 'Ruling House' },
    cur: { type: 'boolean', label: 'Currently Reigning' },
    note: { type: 'text', label: 'Notes' },
    oriki: { type: 'text', label: 'Oriki (Praise Poetry)' },
    children: { type: 'string[]', label: 'Children' },
  },
};
export const KingExample = {
  n: 'Oba James Obafemi Saliu',
  t: 'Kankanbiina II',
  e: 'April 25, 2023 — Present',
  h: 'Kankanbina/Ejigboye Ruling House',
  cur: true,
  note: 'Appointed and installed on April 25, 2023.',
  oriki: null,
  children: [],
};

/** 🖼️ Gallery Photo */
export const GallerySchema = {
  storageKey: 'cms-gallery',
  fields: {
    cat: { type: 'enum', values: ['coronation','palace','lipakala','development','heritage','diaspora'], label: 'Category' },
    title: { type: 'string', label: 'Title', required: true },
    date: { type: 'string', label: 'Date' },
    desc: { type: 'text', label: 'Description' },
    src: { type: 'url', label: 'Image URL' },
    credit: { type: 'string', label: 'Credit' },
    icon: { type: 'emoji', label: 'Icon' },
    bg: { type: 'string', label: 'Background Gradient' },
  },
};

/** 📰 News Article */
export const NewsSchema = {
  storageKey: 'cms-news',
  fields: {
    id: { type: 'string', label: 'ID' },
    date: { type: 'string', label: 'Date' },
    cat: { type: 'enum', values: ['development','royal','community','infrastructure','culture','diaspora'], label: 'Category' },
    headline: { type: 'string', label: 'Headline', required: true },
    body: { type: 'text', label: 'Body' },
    ic: { type: 'emoji', label: 'Icon' },
  },
};

/** 📅 Event */
export const EventSchema = {
  storageKey: 'cms-events',
  fields: {
    title: { type: 'string', label: 'Title', required: true },
    date: { type: 'string', label: 'Date' },
    time: { type: 'string', label: 'Time' },
    venue: { type: 'string', label: 'Venue' },
    desc: { type: 'text', label: 'Description' },
    cat: { type: 'enum', values: ['festival','royal','traditional','community'], label: 'Category' },
    status: { type: 'enum', values: ['upcoming','completed'], label: 'Status' },
    organiser: { type: 'string', label: 'Organiser' },
  },
};

/** 📝 Blog Post */
export const BlogSchema = {
  storageKey: 'cms-blog',
  fields: {
    title: { type: 'string', label: 'Title', required: true },
    slug: { type: 'string', label: 'URL Slug', required: true },
    body: { type: 'richtext', label: 'Content', required: true },
    excerpt: { type: 'text', label: 'Excerpt' },
    featuredImage: { type: 'url', label: 'Featured Image' },
    categories: { type: 'string[]', label: 'Categories' },
    tags: { type: 'string[]', label: 'Tags' },
    author: { type: 'string', label: 'Author' },
    status: { type: 'enum', values: ['draft','published','scheduled'], label: 'Status' },
    publishDate: { type: 'string', label: 'Publish Date' },
  },
};
export const BlogExample = {
  title: 'Aafin Ologere Commissioned',
  slug: 'aafin-ologere-commissioned',
  body: '<p>The Aafin Ologere palace was officially opened...</p>',
  excerpt: 'A historic moment for Ogere Remo.',
  featuredImage: 'https://images.unsplash.com/photo-1551038247-3d935814c02f?w=800&q=80',
  categories: ['royal', 'development'],
  tags: ['palace', 'coronation'],
  author: 'OCDA',
  status: 'published',
  publishDate: 'April 26, 2025',
};

/** 🗺️ Map Location */
export const MapLocationSchema = {
  storageKey: 'cms-maplocations',
  fields: {
    id: { type: 'string', label: 'ID' },
    name: { type: 'string', label: 'Name', required: true },
    cat: { type: 'enum', values: ['Town','Hospitality','Education','Emergency','Commerce','Governance','Heritage','Transport'], label: 'Category' },
    icon: { type: 'emoji', label: 'Icon' },
    color: { type: 'color', label: 'Color' },
    address: { type: 'string', label: 'Address' },
    lat: { type: 'number', label: 'Latitude' },
    lng: { type: 'number', label: 'Longitude' },
    note: { type: 'text', label: 'Notes' },
    phone: { type: 'string', label: 'Phone' },
    rating: { type: 'string', label: 'Rating' },
    hours: { type: 'string', label: 'Hours' },
    website: { type: 'url', label: 'Website' },
  },
};

/** 🌟 Notable Diaspora Person */
export const NotableDiasporaSchema = {
  storageKey: 'cms-diaspora-notable',
  fields: {
    n: { type: 'string', label: 'Name' },
    l: { type: 'string', label: 'Location' },
    f: { type: 'string', label: 'Field/Profession' },
    note: { type: 'text', label: 'Notes' },
    ic: { type: 'emoji', label: 'Icon' },
  },
};

/** 🤝 Diaspora Group */
export const DiasporaGroupSchema = {
  storageKey: 'cms-diaspora-groups',
  fields: {
    n: { type: 'string', label: 'Group Name' },
    d: { type: 'text', label: 'Description' },
    ct: { type: 'string', label: 'Contact' },
  },
};

/** 🖼️ Media Library Item */
export const MediaSchema = {
  storageKey: 'cms-media',
  fields: {
    id: { type: 'string', label: 'ID' },
    url: { type: 'url', label: 'Image URL' },
    label: { type: 'string', label: 'Label' },
    cat: { type: 'string', label: 'Category' },
    added: { type: 'datetime', label: 'Date Added' },
  },
};

/** 📋 Audit Log Entry */
export const AuditSchema = {
  storageKey: 'cms-audit',
  fields: {
    id: { type: 'string', label: 'ID' },
    ts: { type: 'datetime', label: 'Timestamp' },
    action: { type: 'string', label: 'Action' },
    type: { type: 'string', label: 'Content Type' },
    details: { type: 'string', label: 'Details' },
  },
};

/** 📄 Custom Dynamic Page */
export const PageSchema = {
  storageKey: 'cms-pages',
  fields: {
    title: { type: 'string', label: 'Page Title', required: true },
    slug: { type: 'string', label: 'URL Slug', required: true },
    data: { type: 'object', label: 'Puck Layout Data' },
    status: { type: 'enum', values: ['draft', 'published'], label: 'Status' },
  },
};

/**
 * ========================================================================
 *  2. CMS ADMIN USERS
 * ========================================================================
 */

/** 👤 CMS Admin/Editor User */
export const CmsUserSchema = {
  storageKey: 'cms-users',
  fields: {
    id: { type: 'string', label: 'ID' },
    username: { type: 'string', label: 'Username', required: true },
    password: { type: 'string', label: 'Password', required: true },
    role: { type: 'enum', values: ['admin', 'editor'], label: 'Role' },
    name: { type: 'string', label: 'Display Name' },
    created: { type: 'datetime', label: 'Created' },
  },
};

/**
 * ========================================================================
 *  3. SITE USER (Community Member) ACCOUNTS
 * ========================================================================
 */

/** 👤 Site User */
export const SiteUserSchema = {
  storageKey: 'users',
  fields: {
    id: { type: 'string', label: 'ID', example: 'u_abc123' },
    name: { type: 'string', label: 'Full Name', required: true },
    email: { type: 'string', label: 'Email', required: true },
    username: { type: 'string', label: 'Username', required: true, unique: true },
    password: { type: 'string', label: 'Password', required: true },
    role: { type: 'enum', values: ['user'], label: 'Role', default: 'user' },
    created: { type: 'datetime', label: 'Created' },
    avatar: { type: 'url', label: 'Avatar URL' },
    bio: { type: 'text', label: 'Bio' },
    location: { type: 'string', label: 'Location' },
  },
};
export const SiteUserExample = {
  id: 'u_k8m2x9',
  name: 'Kolawole Ogunyemi',
  email: 'kola@example.com',
  username: 'kolaogun',
  password: 'secret123',
  role: 'user',
  created: '2026-05-29T10:30:00.000Z',
  bio: 'Proud son of Ogere Remo.',
  location: 'Lagos, Nigeria',
};

/** 🔐 Session */
export const SessionSchema = {
  storageKey: 'session',
  fields: {
    userId: { type: 'string', label: 'User ID', required: true },
  },
};

/**
 * ========================================================================
 *  4. USER SUBMISSIONS
 * ========================================================================
 * These are created by site users through public forms.
 * The `userId` field links them to the user's account.
 */

/** 🏪 Business Submission */
export const BusinessSubmissionSchema = {
  storageKey: 'biz',
  fields: {
    userId: { type: 'string', label: 'Submitter User ID' },
    name: { type: 'string', label: 'Business Name' },
    category: { type: 'string', label: 'Category' },
    tier: { type: 'enum', values: ['Standard', 'Premium'], label: 'Tier', default: 'Standard' },
    image: { type: 'url', label: 'Business Image' },
    address: { type: 'string', label: 'Address' },
    phone: { type: 'string', label: 'Phone' },
    email: { type: 'string', label: 'Email' },
    desc: { type: 'text', label: 'Description' },
    owner: { type: 'string', label: 'Owner' },
    hours: { type: 'string', label: 'Hours' },
    website: { type: 'url', label: 'Website' },
    ic: { type: 'emoji', label: 'Icon', default: '🏪' },
    status: { type: 'enum', values: ['pending', 'approved'], label: 'Status', default: 'pending' },
    id: { type: 'number', label: 'ID' },
    submitted: { type: 'string', label: 'Submitted Date' },
  },
};

/** 💡 Suggestion Submission */
export const SuggestionSubmissionSchema = {
  storageKey: 'suggestions',
  fields: {
    userId: { type: 'string', label: 'Submitter User ID' },
    name: { type: 'string', label: 'Name' },
    topic: { type: 'string', label: 'Topic' },
    message: { type: 'text', label: 'Suggestion' },
    date: { type: 'string', label: 'Date' },
    status: { type: 'enum', values: ['New', 'Reviewed', 'Archived'], label: 'Status', default: 'New' },
    id: { type: 'number', label: 'ID' },
  },
};

/** ✉️ Contact Message */
export const ContactMessageSchema = {
  storageKey: 'msgs',
  fields: {
    userId: { type: 'string', label: 'Submitter User ID' },
    name: { type: 'string', label: 'Name' },
    email: { type: 'string', label: 'Email' },
    phone: { type: 'string', label: 'Phone' },
    subject: { type: 'string', label: 'Subject' },
    message: { type: 'text', label: 'Message' },
    date: { type: 'string', label: 'Date' },
    id: { type: 'number', label: 'ID' },
  },
};

/** 💬 Forum Post */
export const ForumPostSchema = {
  storageKey: 'forum',
  fields: {
    userId: { type: 'string', label: 'Author User ID' },
    id: { type: 'number', label: 'ID' },
    name: { type: 'string', label: 'Author Name' },
    cat: { type: 'string', label: 'Category' },
    topic: { type: 'string', label: 'Topic' },
    body: { type: 'text', label: 'Body' },
    date: { type: 'string', label: 'Date' },
    replies: { type: 'array', of: { name: 'string', body: 'string', date: 'string' }, label: 'Replies' },
    new: { type: 'boolean', label: 'New' },
  },
};

/** 📋 Association Registration */
export const AssociationSubmissionSchema = {
  storageKey: 'assoc',
  fields: {
    userId: { type: 'string', label: 'Submitter User ID' },
    name: { type: 'string', label: 'Org Name' },
    type: { type: 'string', label: 'Type' },
    contact: { type: 'string', label: 'Contact Person' },
    email: { type: 'string', label: 'Email' },
    phone: { type: 'string', label: 'Phone' },
    desc: { type: 'text', label: 'Description' },
    leader: { type: 'string', label: 'Leader' },
    date: { type: 'string', label: 'Date' },
    status: { type: 'enum', values: ['pending', 'approved'], label: 'Status', default: 'pending' },
  },
};

/**
 * ========================================================================
 *  5. RELATIONSHIPS & DATA FLOW
 * ========================================================================
 *
 *   SiteUser (ogere-users)
 *     ├── id ──────────────────────────────────┐
 *     │                                         │
 *     ├── userId ──→ BusinessSubmission (ogere-biz)           [userId links submission to user]
 *     ├── userId ──→ ContactMessage (ogere-msgs)
 *     ├── userId ──→ ForumPost (ogere-forum)
 *     └── userId ──→ AssociationSubmission (ogere-assoc)
 *
 *   CmsUser (ogere-cms-users)
 *     ├── admin   → Full access to all CMS features + settings + user management
 *     └── editor  → Content CRUD only (no settings, no user management)
 *
 *   ♻️ Data Flow:
 *     Static defaults (src/data/*.js)
 *         ↓ (if no CMS data exists)
 *     getWithFallback('cms-*', STATIC_DATA)
 *         ↓
 *     Frontend pages render from exports
 *         ↑
 *     CMS admin writes to ogere-cms-* keys
 *         ↑
 *     Admin/Editor uses AdminPage.jsx forms
 *
 *   User Submissions Flow:
 *     Public form (BusinessPage, ContactPage, ForumPage, AssociationsPage)
 *         ↓
 *     dbSet('biz'|'msgs'|'forum'|'assoc', array)
 *         ↓
 *     Admin reviews in CMS → approves/rejects/deletes
 *         ↓
 *     Approved content appears on frontend
 */

/**
 * ========================================================================
 *  6. STATIC DATA FALLBACKS
 * ========================================================================
 *
 *   Data File              │ CMS Key                   │ Static Source
 *   ───────────────────────┼───────────────────────────┼─────────────────────────
 *   src/data/kings.js      │ ogere-cms-kings           │ kings array
 *   src/data/gallery.js    │ ogere-cms-gallery         │ photos array
 *   src/data/news.js       │ ogere-cms-news            │ STATIC_NEWS array
 *   src/data/events.js     │ ogere-cms-events          │ STATIC_EVENTS array
 *   src/data/diaspora.js   │ ogere-cms-diaspora-notable│ notable array
 *   src/data/diaspora.js   │ ogere-cms-diaspora-groups │ diasporaGroups array
 *   src/data/mapLocations.js│ ogere-cms-maplocations   │ MAP_LOCATIONS array
 *
 *   Each data file uses getWithFallback('cms-{type}', STATIC_DATA)
 *   to check localStorage first, then fall back to the static import.
 *   This ensures CMS changes reflect on the frontend after a page refresh.
 */

/**
 * ========================================================================
 *  7. ENVIRONMENT VARIABLES
 * ========================================================================
 *
 *   VITE_ADMIN_PASSWORD    │ Default admin password fallback (for backward compat)
 *   VITE_ANTHROPIC_API_KEY │ Optional Anthropic Claude API key for AI features
 */

/**
 * ========================================================================
 *  8. STORAGE KEY INDEX
 * ========================================================================
 *
 *   Key Prefix: ogere-
 *
 *   Key                        │ Type     │ Managed By
 *   ───────────────────────────┼──────────┼────────────────
 *   ogere-cms-kings            │ content  │ CMS Admin
 *   ogere-cms-gallery          │ content  │ CMS Admin
 *   ogere-cms-news             │ content  │ CMS Admin
 *   ogere-cms-events           │ content  │ CMS Admin
 *   ogere-cms-diaspora-notable │ content  │ CMS Admin
 *   ogere-cms-diaspora-groups  │ content  │ CMS Admin
 *   ogere-cms-maplocations     │ content  │ CMS Admin
 *   ogere-cms-blog             │ content  │ CMS Admin
 *   ogere-cms-media            │ content  │ CMS Admin
 *   ogere-cms-audit            │ content  │ CMS Admin
 *   ogere-cms-users            │ users    │ CMS Admin
 *   ogere-biz                  │ sub      │ Users + Admin
 *   ogere-msgs                 │ sub      │ Users + Admin
 *   ogere-forum                │ sub      │ Users + Admin
 *   ogere-assoc                │ sub      │ Users + Admin
 *   ogere-users                │ users    │ Auth Service
 *   ogere-session              │ session  │ Auth Service
 */

export const ALL_SCHEMAS = {
  KingSchema, GallerySchema, NewsSchema, EventSchema, BlogSchema,
  MapLocationSchema, NotableDiasporaSchema, DiasporaGroupSchema,
  MediaSchema, AuditSchema, PageSchema, CmsUserSchema, SiteUserSchema, SessionSchema,
  BusinessSubmissionSchema, SuggestionSubmissionSchema, ContactMessageSchema, ForumPostSchema,
  AssociationSubmissionSchema,
};
