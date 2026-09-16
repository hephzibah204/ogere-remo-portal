import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';

const EMERGENCY_PHONES = [
  { label: 'Police DPO (08081762371)', phone: '08081762371', icon: '🚔' },
  { label: 'FRSC Rescue 122', phone: '122', icon: '🚑' },
  { label: 'So-Safe Command', phone: '08099776655', icon: '🛡️' },
  { label: 'Hospital Emergency', phone: '08123456781', icon: '🏥' },
];

export const SosInterceptScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  // Incident can be passed directly via route params OR fetched by ID
  const { incident: passedIncident, incidentId } = route?.params || {};
  const [incident, setIncident] = useState<any>(passedIncident || null);
  const [loading, setLoading] = useState(!passedIncident);
  const [updating, setUpdating] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch full incident if not passed
  useEffect(() => {
    if (!passedIncident && incidentId) {
      fetch(`${API_BASE_URL}/api/incidents?id=${incidentId}`)
        .then(r => r.json())
        .then(d => {
          const inc = d.incident || d.incidents?.[0] || null;
          setIncident(inc);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [incidentId]);

  // Poll live location if live tracking is active
  useEffect(() => {
    if (!incident?.id || !incident?.is_live_tracking) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/live-location?incidentId=${incident.id}`);
        if (res.ok) {
          const d = await res.json();
          const latest = d.breadcrumbs?.[0] || d.location;
          if (latest?.latitude && latest?.longitude) {
            setLiveCoords({ lat: latest.latitude, lng: latest.longitude });
          }
        }
      } catch {}
    };
    poll();
    liveRef.current = setInterval(poll, 5000);
    return () => { if (liveRef.current) clearInterval(liveRef.current); };
  }, [incident?.id]);

  const effectiveLat = liveCoords?.lat ?? incident?.latitude;
  const effectiveLng = liveCoords?.lng ?? incident?.longitude;
  const mapsUrl = effectiveLat && effectiveLng
    ? incident?.google_maps_url || `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`
    : null;
  const navUrl = effectiveLat && effectiveLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${effectiveLat},${effectiveLng}&travelmode=driving`
    : null;

  const handleUpdateStatus = async (newStatus: string) => {
    if (!incident?.id) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/incidents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: incident.id,
          status: newStatus,
          respondingUnit: 'Mobile Patrol Unit',
        }),
      });
      if (res.ok) {
        setIncident((prev: any) => ({ ...prev, status: newStatus }));
        Alert.alert('✅ Status Updated', `Incident marked as: ${newStatus.toUpperCase()}`);
      }
    } catch {
      Alert.alert('Network Error', 'Could not update status. Try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = (phone: string, label: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Cannot Dial', `Please call ${label} manually.`));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Fetching incident data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={{ fontSize: 32 }}>⚠️</Text>
          <Text style={styles.loadingText}>Incident not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTopBtn}>
            <Text style={styles.backTopBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCodeRed = incident.threat_level === 'CODE_RED';
  const statusColor =
    incident.status === 'resolved' ? '#22c55e'
    : incident.status === 'dispatched' ? '#3b82f6'
    : incident.status === 'investigating' ? '#f59e0b'
    : '#ef4444';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isCodeRed ? '#ef4444' : '#f59e0b' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: isCodeRed ? '#f87171' : '#fde047' }]} numberOfLines={1}>
            {isCodeRed ? '🚨 CODE RED INTERCEPT' : '⚠️ INCIDENT BRIEF'} — {incident.id}
          </Text>
          <Text style={styles.headerSub}>{incident.category}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '33', borderColor: statusColor }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>
            {(incident.status || 'OPEN').toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── SECTION 1: LIVE LOCATION ─────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>📍 REPORTER GEOLOCATION</Text>

          {/* Big GPS display */}
          <View style={styles.gpsBlock}>
            <View style={styles.gpsBigRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsCoordLabel}>LATITUDE</Text>
                <Text style={styles.gpsCoordValue}>
                  {effectiveLat ? effectiveLat.toFixed(6) + '°N' : 'Unknown'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsCoordLabel}>LONGITUDE</Text>
                <Text style={styles.gpsCoordValue}>
                  {effectiveLng ? effectiveLng.toFixed(6) + '°E' : 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.gpsMetaRow}>
              <View style={styles.gpsMeta}>
                <Text style={styles.gpsMetaLabel}>GPS ACCURACY</Text>
                <Text style={[styles.gpsMetaValue, {
                  color: incident.accuracy && incident.accuracy < 30 ? '#4ade80' : '#fde047'
                }]}>
                  {incident.accuracy ? `±${Math.round(incident.accuracy)}m` : 'Estimated'}
                </Text>
              </View>
              <View style={styles.gpsMeta}>
                <Text style={styles.gpsMetaLabel}>REPORTER IP</Text>
                <Text style={styles.gpsMetaValue}>{incident.ip_address || 'Not captured'}</Text>
              </View>
              <View style={styles.gpsMeta}>
                <Text style={styles.gpsMetaLabel}>LIVE TRACK</Text>
                <Text style={[styles.gpsMetaValue, {
                  color: incident.is_live_tracking ? '#4ade80' : '#94a3b8'
                }]}>
                  {incident.is_live_tracking ? '🟢 ACTIVE' : '⚫ OFF'}
                </Text>
              </View>
            </View>

            {liveCoords && (
              <View style={styles.liveUpdateBadge}>
                <Text style={styles.liveUpdateText}>
                  🔴 LIVE POSITION UPDATED — {liveCoords.lat.toFixed(5)}, {liveCoords.lng.toFixed(5)}
                </Text>
              </View>
            )}
          </View>

          {/* Map action buttons */}
          <View style={styles.mapBtnRow}>
            <TouchableOpacity
              style={styles.mapPinBtn}
              onPress={() => mapsUrl && Linking.openURL(mapsUrl)}
              disabled={!mapsUrl}
            >
              <Text style={styles.mapBtnEmoji}>🗺️</Text>
              <Text style={styles.mapBtnText}>View Exact Pin</Text>
              <Text style={styles.mapBtnSub}>Opens reporter's GPS dot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => navUrl && Linking.openURL(navUrl)}
              disabled={!navUrl}
            >
              <Text style={styles.mapBtnEmoji}>🧭</Text>
              <Text style={styles.mapBtnText}>Navigate to Victim</Text>
              <Text style={styles.mapBtnSub}>Turn-by-turn driving</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SECTION 2: INCIDENT BRIEF ────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🚨 INCIDENT BRIEF</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CATEGORY</Text>
            <Text style={styles.infoValue}>{incident.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>THREAT LEVEL</Text>
            <Text style={[styles.infoValue, { color: isCodeRed ? '#f87171' : '#fde047', fontWeight: '900' }]}>
              {incident.threat_level || 'Unknown'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SEVERITY</Text>
            <Text style={styles.infoValue}>{incident.severity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>LOCATION</Text>
            <Text style={styles.infoValue}>{incident.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIME REPORTED</Text>
            <Text style={styles.infoValue}>
              {incident.created_at
                ? new Date(incident.created_at).toLocaleString('en-NG', {
                    dateStyle: 'medium', timeStyle: 'short',
                  })
                : 'Unknown'}
            </Text>
          </View>

          {/* Full description */}
          <View style={styles.descBox}>
            <Text style={styles.descLabel}>FULL INCIDENT DESCRIPTION</Text>
            <Text style={styles.descText}>{incident.description || 'No description provided.'}</Text>
          </View>
        </View>

        {/* ── SECTION 3: REPORTER IDENTITY ─────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>👤 REPORTER IDENTITY</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NAME</Text>
            <Text style={styles.infoValue}>{incident.reporter_name || 'Anonymous'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE</Text>
            <Text style={styles.infoValue}>{incident.reporter_phone || 'Not provided'}</Text>
          </View>
          {incident.reporter_phone && incident.reporter_phone !== 'N/A' && (
            <TouchableOpacity
              style={styles.callReporterBtn}
              onPress={() => handleCall(incident.reporter_phone, incident.reporter_name)}
            >
              <Text style={styles.callReporterBtnText}>📞 Call Reporter Now</Text>
            </TouchableOpacity>
          )}
          {incident.is_silent_panic && (
            <View style={styles.silentPanicBadge}>
              <Text style={styles.silentPanicText}>🤫 SILENT PANIC ALERT — Do NOT call. Reporter may be in danger. Covert approach only.</Text>
            </View>
          )}
        </View>

        {/* ── SECTION 4: DEVICE INTELLIGENCE ──────────────────────────── */}
        {(incident.device_model || incident.device_os || incident.network_type || incident.battery_level != null) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>📱 DEVICE INTELLIGENCE</Text>
            <View style={styles.deviceGrid}>
              {incident.device_model && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>DEVICE</Text>
                  <Text style={styles.deviceCellValue}>{incident.device_model}</Text>
                </View>
              )}
              {incident.device_os && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>OS</Text>
                  <Text style={styles.deviceCellValue}>{incident.device_os}</Text>
                </View>
              )}
              {incident.network_type && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>NETWORK</Text>
                  <Text style={[styles.deviceCellValue, {
                    color: incident.network_type === 'wifi' ? '#4ade80' : '#38bdf8'
                  }]}>
                    {incident.network_type.toUpperCase()}
                    {incident.network_generation ? ' · ' + incident.network_generation.toUpperCase() : ''}
                    {incident.carrier ? '\n' + incident.carrier : ''}
                  </Text>
                </View>
              )}
              {incident.battery_level != null && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>BATTERY</Text>
                  <Text style={[styles.deviceCellValue, {
                    color: incident.battery_level > 20 ? '#4ade80' : '#ef4444', fontWeight: '900'
                  }]}>
                    {incident.battery_level}%
                    {incident.battery_level <= 15 ? ' ⚠️ CRITICAL — phone may die soon' : ''}
                  </Text>
                </View>
              )}
              {incident.screen_resolution && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>SCREEN</Text>
                  <Text style={styles.deviceCellValue}>{incident.screen_resolution}</Text>
                </View>
              )}
              {incident.timezone && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>TIMEZONE</Text>
                  <Text style={styles.deviceCellValue}>{incident.timezone}</Text>
                </View>
              )}
              {incident.locale && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>LOCALE</Text>
                  <Text style={styles.deviceCellValue}>{incident.locale}</Text>
                </View>
              )}
              {incident.app_version && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>APP VERSION</Text>
                  <Text style={styles.deviceCellValue}>{incident.app_version}</Text>
                </View>
              )}
            </View>
            {incident.user_agent && (
              <View style={styles.uaBox}>
                <Text style={styles.uaLabel}>USER AGENT</Text>
                <Text style={styles.uaValue} numberOfLines={2}>{incident.user_agent}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── SECTION 5: RESPONSE UNITS ────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🛡️ ASSIGNED RESPONSE</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AGENCY</Text>
            <Text style={styles.infoValue}>{incident.assigned_agency || 'All Agencies'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UNIT</Text>
            <Text style={styles.infoValue}>{incident.responding_unit || '—'}</Text>
          </View>
          {incident.agency_notes && (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>FIELD NOTES</Text>
              <Text style={styles.descText}>{incident.agency_notes}</Text>
            </View>
          )}
        </View>

        {/* ── SECTION 6: QUICK-DIAL EMERGENCY ──────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>📞 EMERGENCY SPEED DIAL</Text>
          <View style={styles.dialGrid}>
            {EMERGENCY_PHONES.map(ep => (
              <TouchableOpacity
                key={ep.phone}
                style={styles.dialBtn}
                onPress={() => handleCall(ep.phone, ep.label)}
              >
                <Text style={{ fontSize: 18 }}>{ep.icon}</Text>
                <Text style={styles.dialBtnText}>{ep.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── SECTION 7: STATUS UPDATE CONTROLS ────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🔁 UPDATE INCIDENT STATUS</Text>
          {updating && <ActivityIndicator color="#ef4444" style={{ marginBottom: 8 }} />}
          <View style={styles.statusBtnRow}>
            {['dispatched', 'investigating', 'resolved'].map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  incident.status === s && styles.statusBtnActive,
                  s === 'resolved' && { borderColor: '#22c55e' },
                  s === 'dispatched' && { borderColor: '#3b82f6' },
                  s === 'investigating' && { borderColor: '#f59e0b' },
                ]}
                onPress={() => handleUpdateStatus(s)}
                disabled={updating || incident.status === s}
              >
                <Text style={[
                  styles.statusBtnText,
                  s === 'resolved' && { color: '#4ade80' },
                  s === 'dispatched' && { color: '#93c5fd' },
                  s === 'investigating' && { color: '#fde047' },
                ]}>
                  {s === 'dispatched' ? '🚔 DISPATCHED' : s === 'investigating' ? '🔍 INVESTIGATING' : '✅ RESOLVED'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090909' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#94a3b8', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 2,
    gap: 10,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
  },
  backTopBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  backTopBtnText: { color: '#94a3b8', fontWeight: '700' },
  backBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  headerTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  headerSub: { color: '#64748b', fontSize: 10, marginTop: 2 },
  statusPill: {
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1,
  },
  statusPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  content: { padding: 14, gap: 12, paddingBottom: 40 },

  // Section cards
  sectionCard: {
    backgroundColor: '#111111',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 2,
  },

  // GPS Block
  gpsBlock: { gap: 8 },
  gpsBigRow: { flexDirection: 'row', gap: 8 },
  gpsCoordLabel: { fontSize: 8, fontWeight: '900', color: '#334155', letterSpacing: 0.5, marginBottom: 2 },
  gpsCoordValue: { fontSize: 16, fontWeight: '900', color: '#f8fafc', fontFamily: 'monospace' as any },
  gpsMetaRow: { flexDirection: 'row', gap: 6 },
  gpsMeta: { flex: 1, backgroundColor: '#0f172a', padding: 8, borderRadius: 6 },
  gpsMetaLabel: { fontSize: 7, fontWeight: '900', color: '#334155', letterSpacing: 0.5, marginBottom: 2 },
  gpsMetaValue: { fontSize: 11, fontWeight: '800', color: '#94a3b8', fontFamily: 'monospace' as any },
  liveUpdateBadge: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dc2626',
    padding: 6,
  },
  liveUpdateText: { color: '#f87171', fontSize: 10, fontWeight: '800', textAlign: 'center' },

  // Map buttons
  mapBtnRow: { flexDirection: 'row', gap: 8 },
  mapPinBtn: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#1a3323',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  mapBtnEmoji: { fontSize: 22 },
  mapBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800', marginTop: 2 },
  mapBtnSub: { color: '#64748b', fontSize: 9, marginTop: 1 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#475569', width: 110 },
  infoValue: { fontSize: 11, fontWeight: '700', color: '#e2e8f0', flex: 1, textAlign: 'right' },

  // Description box
  descBox: { backgroundColor: '#0f172a', borderRadius: 6, padding: 10, marginTop: 4 },
  descLabel: { fontSize: 8, fontWeight: '900', color: '#334155', letterSpacing: 0.5, marginBottom: 6 },
  descText: { fontSize: 12, color: '#cbd5e1', lineHeight: 18 },

  // Reporter call button
  callReporterBtn: {
    backgroundColor: '#166534',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
    marginTop: 4,
  },
  callReporterBtnText: { color: '#4ade80', fontSize: 13, fontWeight: '900' },
  silentPanicBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#475569',
    padding: 8,
    marginTop: 4,
  },
  silentPanicText: { color: '#94a3b8', fontSize: 10, fontWeight: '700', lineHeight: 15 },

  // Device grid
  deviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deviceCell: {
    minWidth: '30%',
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 8,
  },
  deviceCellLabel: { fontSize: 7, fontWeight: '900', color: '#334155', letterSpacing: 0.5, marginBottom: 3 },
  deviceCellValue: { fontSize: 10, fontWeight: '700', color: '#94a3b8', fontFamily: 'monospace' as any },
  uaBox: { backgroundColor: '#0f172a', borderRadius: 6, padding: 8 },
  uaLabel: { fontSize: 7, fontWeight: '900', color: '#334155', letterSpacing: 0.5, marginBottom: 3 },
  uaValue: { fontSize: 9, color: '#475569', fontFamily: 'monospace' as any },

  // Speed dial
  dialGrid: { gap: 8 },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: Radius.md,
    padding: 11,
  },
  dialBtnText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },

  // Status update buttons
  statusBtnRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
  },
  statusBtnActive: { opacity: 0.4 },
  statusBtnText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textAlign: 'center' },
});
