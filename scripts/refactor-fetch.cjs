const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add apiRequest import if not present
if (!content.includes('import { apiRequest }')) {
  content = content.replace(
    "import SEO from '../components/SEO';",
    "import SEO from '../components/SEO';\nimport { apiRequest } from '../services/apiClient';"
  );
}

// Function to replace simple fetch blocks
// e.g. const res = await fetch(url); if(res.ok) { const data = await res.json(); setIncidents(data); }

// Replace fetchIncidents
content = content.replace(
  /const res = await fetch\(url\);\s*if \(!res\.ok\) throw new Error\('API Error'\);\s*const data = await res\.json\(\);\s*setIncidents\(data\);/g,
  "const data = await apiRequest(url);\n      if (data) setIncidents(data);"
);

// Replace fetchBroadcasts
content = content.replace(
  /const res = await fetch\('\/api\/broadcasts'\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*setBroadcasts\(data\.broadcasts \|\| \[\]\);\s*\}/g,
  "const data = await apiRequest('/api/broadcasts');\n      if (data) setBroadcasts(data.broadcasts || []);"
);

// Replace fetchTips
content = content.replace(
  /const res = await fetch\('\/api\/whistleblower'\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*setTips\(data\.tips \|\| \[\]\);\s*\}/g,
  "const data = await apiRequest('/api/whistleblower');\n      if (data) setTips(data.tips || []);"
);

// Replace fetchPatrolData
content = content.replace(
  /const res = await fetch\('\/api\/patrol-checkin'\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*setPatrolData\(data\);\s*\}/g,
  "const data = await apiRequest('/api/patrol-checkin');\n      if (data) setPatrolData(data);"
);

// Replace handleScanCctv
content = content.replace(
  /const res = await fetch\(`\/api\/cctv\?lat=\$\{activeIncident\.latitude\}&lng=\$\{activeIncident\.longitude\}&radiusKm=1\.5`\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*setNearbyCctv\(data\.cameras \|\| \[\]\);\s*\}/g,
  "const data = await apiRequest(`/api/cctv?lat=${activeIncident.latitude}&lng=${activeIncident.longitude}&radiusKm=1.5`);\n      if (data) setNearbyCctv(data.cameras || []);"
);

// Replace handleDeactivateBroadcast
content = content.replace(
  /const res = await fetch\('\/api\/broadcasts', \{\s*method: 'PATCH',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ id, isActive: false \}\),\s*\}\);\s*if \(res\.ok\) fetchBroadcasts\(\);/g,
  "const data = await apiRequest('/api/broadcasts', { method: 'PATCH', body: { id, isActive: false } });\n      if (data) fetchBroadcasts();"
);

// Replace handleUpdateTipSitrep
content = content.replace(
  /const res = await fetch\('\/api\/whistleblower', \{\s*method: 'PATCH',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*tipToken: selectedTip\.tip_token,\s*status: tipStatus,\s*sitrep: tipSitrep\s*\}\),\s*\}\);\s*if \(res\.ok\) \{\s*setShowTipsModal\(false\);\s*fetchTips\(\);\s*\}/g,
  "const data = await apiRequest('/api/whistleblower', {\n        method: 'PATCH',\n        body: {\n          tipToken: selectedTip.tip_token,\n          status: tipStatus,\n          sitrep: tipSitrep\n        }\n      });\n      if (data) {\n        setShowTipsModal(false);\n        fetchTips();\n      }"
);

// Replace handleCreateBroadcast
content = content.replace(
  /const res = await fetch\('\/api\/broadcasts', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(broadcastForm\),\s*\}\);\s*if \(res\.ok\) \{\s*setShowBroadcastModal\(false\);\s*setBroadcastForm\(\{ title: '', message: '', severity: 'info', expires_in_hours: 24, target_area: 'all' \}\);\s*fetchBroadcasts\(\);\s*\}/g,
  "const data = await apiRequest('/api/broadcasts', {\n        method: 'POST',\n        body: broadcastForm\n      });\n      if (data) {\n        setShowBroadcastModal(false);\n        setBroadcastForm({ title: '', message: '', severity: 'info', expires_in_hours: 24, target_area: 'all' });\n        fetchBroadcasts();\n      }"
);

// Replace fetchLiveDetails
content = content.replace(
  /const res = await fetch\(`\/api\/live-location\?incidentId=\$\{encodeURIComponent\(activeIncident\.id\)\}`\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*if \(data\.incident\) \{\s*setActiveIncident\(prev => prev && prev\.id === data\.incident\.id \? \{ \.\.\.prev, \.\.\.data\.incident \} : prev\);\s*\}\s*\}/g,
  "const data = await apiRequest(`/api/live-location?incidentId=${encodeURIComponent(activeIncident.id)}`);\n        if (data?.incident) {\n          setActiveIncident(prev => prev && prev.id === data.incident.id ? { ...prev, ...data.incident } : prev);\n        }"
);

// Replace handleUpdateStatus
content = content.replace(
  /const res = await fetch\('\/api\/incidents', \{\s*method: 'PATCH',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*id: activeIncident\.id,\s*status: newStatus,\s*sitrep: customSitrep \|\| newSitrepText,\s*\}\),\s*\}\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*setActiveIncident\(data\.incident\);\s*setNewSitrepText\(''\);\s*fetchIncidents\(\);\s*\}/g,
  "const data = await apiRequest('/api/incidents', {\n        method: 'PATCH',\n        body: {\n          id: activeIncident.id,\n          status: newStatus,\n          sitrep: customSitrep || newSitrepText\n        }\n      });\n      if (data?.incident) {\n        setActiveIncident(data.incident);\n        setNewSitrepText('');\n        fetchIncidents();\n      }"
);

// Replace handleManualDispatch
content = content.replace(
  /const res = await fetch\('\/api\/incidents', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*category: manualReport\.category,\s*threatLevel: manualReport\.threatLevel,\s*description: manualReport\.description,\s*location: manualReport\.location,\s*reporterInfo: manualReport\.reporterInfo,\s*status: 'dispatched',\s*is_live_tracking: false,\s*\}\),\s*\}\);\s*if \(res\.ok\) \{\s*setNewIncidentForm\(false\);\s*setManualReport\(\{ category: 'Crime', threatLevel: 'ELEVATED', description: '', location: '', reporterInfo: '' \}\);\s*fetchIncidents\(\);\s*\}/g,
  "const data = await apiRequest('/api/incidents', {\n        method: 'POST',\n        body: {\n          category: manualReport.category,\n          threatLevel: manualReport.threatLevel,\n          description: manualReport.description,\n          location: manualReport.location,\n          reporterInfo: manualReport.reporterInfo,\n          status: 'dispatched',\n          is_live_tracking: false,\n        }\n      });\n      if (data) {\n        setNewIncidentForm(false);\n        setManualReport({ category: 'Crime', threatLevel: 'ELEVATED', description: '', location: '', reporterInfo: '' });\n        fetchIncidents();\n      }"
);


fs.writeFileSync(targetFile, content);
console.log('Done refactoring fetch calls!');
