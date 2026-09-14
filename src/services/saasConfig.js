/**
 * Ogere Remo SaaS Master Configuration & Feature Flags Engine
 * Controls sitewide module toggles, branding, paystack keys, and royal operational modes.
 */

const SAAS_CONFIG_KEY = 'ogere_saas_master_config';

export const DEFAULT_SAAS_CONFIG = {
  // 1. Kingdom & Platform Identity
  identity: {
    kingdomName: 'Kingdom of Ogere Remo',
    tagline: 'Ancient Town Upon the Hills — Founded circa 1401 A.D.',
    reigningMonarch: 'His Royal Highness, The Ologere of Ogere Remo',
    officialEmail: 'secretariat@ogereremo.ng',
    emergencyHotline: '+234 800 OGERE SOS (0800 643 73767)',
    primaryColor: '#C9963A', // Royal Gold
    secondaryColor: '#1a0d06', // Royal Mahogany
    currency: 'NGN (₦)',
    siteStatus: 'live', // live, maintenance, emergency
  },

  // 2. Global Module Toggles (Feature Flags)
  modules: {
    idCardSystem: { enabled: true, name: 'Digital Citizen ID Cards & QR Verification', icon: '🪪' },
    royalAudience: { enabled: true, name: 'Royal Audience Palace Booking Engine', icon: '👑' },
    landRegistry: { enabled: true, name: 'Digital Land Registry & Dispute Resolution', icon: '📜' },
    marketplace: { enabled: true, name: 'Community Marketplace & Local Trade', icon: '🛒' },
    businessDirectory: { enabled: true, name: 'Verified Commercial Directory', icon: '🏪' },
    diasporaGiving: { enabled: true, name: 'Diaspora Projects & Paystack Giving', icon: '🎁' },
    scholarships: { enabled: true, name: 'STEM Scholarships & Education Grants', icon: '🎓' },
    securityDispatch: { enabled: true, name: 'Emergency Incident Dispatch & CCTV Network', icon: '🚨' },
    communityForum: { enabled: true, name: 'Civic Deliberation & Community Forum', icon: '💬' },
    heritageQuiz: { enabled: true, name: 'Heritage Trivia & Leaderboard Certificates', icon: '🧠' },
    palaceLiveTv: { enabled: true, name: 'Palace TV & Live Ceremony Broadcast', icon: '📺' },
    bloodDonors: { enabled: true, name: 'Emergency Voluntary Blood Bank Registry', icon: '🩸' },
  },

  // 3. Monetization & Payment Gateways
  payments: {
    paystackEnabled: true,
    paystackPublicKey: 'pk_test_d3a3d5b0c9a4561234567890abcdef12345678',
    idCardFeeNaira: 2500,
    marketplaceListingFeeNaira: 1000,
    landSearchFeeNaira: 5000,
  },

  // 4. Sitewide Live Announcement Banner
  broadcast: {
    enabled: true,
    type: 'royal', // royal, festival, alert, info
    message: '👑 Welcome to the Official Portal of Ogere Remo Kingdom. 50th Lipakala Day Golden Jubilee registrations are active.',
    ctaLabel: 'Learn More',
    ctaLink: '/diaspora',
    expiresAt: null,
  },
};

/**
 * Get current SaaS Master Configuration
 */
export function getSaasConfig() {
  try {
    const raw = localStorage.getItem(SAAS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAAS_CONFIG,
        ...parsed,
        identity: { ...DEFAULT_SAAS_CONFIG.identity, ...parsed.identity },
        modules: { ...DEFAULT_SAAS_CONFIG.modules, ...parsed.modules },
        payments: { ...DEFAULT_SAAS_CONFIG.payments, ...parsed.payments },
        broadcast: { ...DEFAULT_SAAS_CONFIG.broadcast, ...parsed.broadcast },
      };
    }
  } catch (err) {
    console.warn('Error reading SaaS config:', err);
  }
  return DEFAULT_SAAS_CONFIG;
}

/**
 * Save updated SaaS Master Configuration
 */
export function saveSaasConfig(newConfig) {
  try {
    localStorage.setItem(SAAS_CONFIG_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('saas-config-updated', { detail: newConfig }));
    return true;
  } catch (err) {
    console.error('Error saving SaaS config:', err);
    return false;
  }
}

/**
 * Check if a specific module/feature flag is active
 */
export function isModuleEnabled(moduleKey) {
  const config = getSaasConfig();
  return config.modules[moduleKey]?.enabled !== false;
}
