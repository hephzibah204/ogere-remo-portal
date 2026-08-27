/**
 * Ogere Remo Unified Backend API Client
 * Connects frontend views to Vercel Serverless `/api/*` routes with automatic fallback.
 */

export async function apiRequest(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `API error (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Backend API Client] Endpoint ${endpoint} fallback:`, err.message);
    return null;
  }
}

// 1. Verify Community ID
export async function verifyIdOnline(code) {
  return await apiRequest(`/api/verify-id?code=${encodeURIComponent(code)}`);
}

// 2. Submit ID Card Application
export async function submitIdApplication(data) {
  return await apiRequest('/api/id-cards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 3. Book Royal Audience
export async function bookRoyalAudience(data) {
  return await apiRequest('/api/royal-audiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 4. Query & Submit Marketplace
export async function submitMarketplaceListing(data) {
  return await apiRequest('/api/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 5. Query Land Registry
export async function searchLandPlot(plotId) {
  return await apiRequest(`/api/land-registry?plotId=${encodeURIComponent(plotId)}`);
}

// 6. Record Diaspora Donation
export async function recordProjectDonation(data) {
  return await apiRequest('/api/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
