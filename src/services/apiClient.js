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
      throw new Error(errData.message || errData.error || `API error (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Backend API Client] Endpoint ${endpoint} notice:`, err.message);
    return null;
  }
}

// ── 1. Community ID Card Registry ──
export async function verifyIdOnline(code) {
  return await apiRequest(`/api/verify-id?code=${encodeURIComponent(code)}`);
}

export async function submitIdApplication(data) {
  return await apiRequest('/api/id-cards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchIdCards() {
  return await apiRequest('/api/id-cards');
}

// ── 2. Royal Audiences ──
export async function bookRoyalAudience(data) {
  return await apiRequest('/api/royal-audiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function trackRoyalAudience(code) {
  return await apiRequest(`/api/royal-audiences?action=track&code=${encodeURIComponent(code)}`);
}

export async function fetchRoyalAudiences() {
  return await apiRequest('/api/royal-audiences');
}

// ── 3. Digital Land Registry ──
export async function searchLandPlot(plotId) {
  return await apiRequest(`/api/land-registry?plotId=${encodeURIComponent(plotId)}`);
}

export async function fetchLandRegistry(area = 'All') {
  const q = area && area !== 'All' ? `?area=${encodeURIComponent(area)}` : '';
  return await apiRequest(`/api/land-registry${q}`);
}

export async function registerLandPlot(data) {
  return await apiRequest('/api/land-registry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── 4. Community Marketplace ──
export async function fetchMarketplaceListings(category = 'All', quarter = 'All Quarters') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (quarter && quarter !== 'All Quarters') params.set('quarter', quarter);
  const q = params.toString() ? `?${params.toString()}` : '';
  return await apiRequest(`/api/marketplace${q}`);
}

export async function submitMarketplaceListing(data) {
  return await apiRequest('/api/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── 5. Diaspora Donations & Fundraising ──
export async function recordProjectDonation(data) {
  return await apiRequest('/api/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchDonationStats() {
  return await apiRequest('/api/donations?stats=true');
}

export async function fetchDonationsSummary() {
  return await apiRequest('/api/donations');
}

// ── 6. Scholarships & Bursaries ──
export async function fetchScholarships() {
  return await apiRequest('/api/scholarships');
}

export async function submitScholarship(data) {
  return await apiRequest('/api/scholarships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── 7. Community Forum & Civic Timeline ("What's on your mind?") ──
export async function fetchForumPosts() {
  return await apiRequest('/api/forum');
}

export async function submitForumPost(data) {
  return await apiRequest('/api/forum', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchTimelinePosts() {
  return await apiRequest('/api/timeline');
}

export async function submitTimelinePost(data) {
  return await apiRequest('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({ action: 'create_post', ...data }),
  });
}

export async function likeTimelinePost(postId, userId, userName) {
  return await apiRequest('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({ action: 'like_post', postId, userId, userName }),
  });
}

export async function addTimelineComment(postId, authorName, authorAvatar, commentText) {
  return await apiRequest('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({
      action: 'add_comment',
      postId,
      author_name: authorName,
      author_avatar: authorAvatar,
      comment_text: commentText,
    }),
  });
}

export async function followUser(currentUser, targetUser) {
  return await apiRequest('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({ action: 'follow_user', current_user: currentUser, target_user: targetUser }),
  });
}

export async function addFriend(currentUser, targetUser) {
  return await apiRequest('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({ action: 'add_friend', current_user: currentUser, target_user: targetUser }),
  });
}

export async function fetchDirectMessages(user1, user2) {
  return await apiRequest(`/api/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
}

export async function sendDirectMessage(senderName, recipientName, messageText) {
  return await apiRequest('/api/messages', {
    method: 'POST',
    body: JSON.stringify({
      senderName,
      recipientName,
      text: messageText,
      channelId: 'direct',
    }),
  });
}

// ── 8. Security & Emergency Operations ──
export async function fetchIncidents() {
  return await apiRequest('/api/incidents');
}

export async function submitIncident(data) {
  return await apiRequest('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── 9. Administrative Governance ──
export async function submitAdminAction(actionType, targetId, status, notes) {
  return await apiRequest('/api/admin-actions', {
    method: 'POST',
    body: JSON.stringify({ actionType, targetId, status, notes }),
  });
}

export async function fetchHealth() {
  return await apiRequest('/api/health');
}
