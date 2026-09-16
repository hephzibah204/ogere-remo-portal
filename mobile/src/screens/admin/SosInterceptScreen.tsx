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
  Image,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';

const EMERGENCY_PHONES = [
  { label: 'Police DPO (08081762371)', phone: '08081762371', icon: '🚔' },
  { label: 'FRSC Rescue 122', phone: '122', icon: '🚑' },
  { label: 'So-Safe Command', phone: '08099776655', icon: '🛡️' },
  { label: 'Hospital Emergency', phone: '08123456781', icon: '🏥' },
];

/**
 * Calculate OpenStreetMap tile coordinates for standard Slippy map tiles (256x256)
 */
function latLngToTile(lat: number, lng: number, zoom = 16) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, zoom };
}

/**
 * Calculate the exact percentage position inside the tile for marker placement
 */
function latLngToOffset(lat: number, lng: number, zoom = 16) {
  const n = Math.pow(2, zoom);
  const xExact = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yExact = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const offsetX = Math.max(5, Math.min(95, Math.round((xExact - Math.floor(xExact)) * 100)));
  const offsetY = Math.max(5, Math.min(95, Math.round((yExact - Math.floor(yExact)) * 100)));
  return { offsetX, offsetY };
}

export const SosInterceptScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { incident: passedIncident, incidentId } = route?.params || {};
  const [incident, setIncident] = useState<any>(passedIncident || null);
  const [loading, setLoading] = useState(!passedIncident);
  const [updating, setUpdating] = useState(false);

  // Live Location Telemetry State (like WhatsApp Live Location)
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [liveSpeed, setLiveSpeed] = useState<number | null>(null);
  const [liveHeading, setLiveHeading] = useState<number | null>(null);
  const [liveAccuracy, setLiveAccuracy] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [lastUpdateAt, setLastUpdateAt] = useState<string>('');
  const [pingCount, setPingCount] = useState<number>(0);

  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch full incident if not passed
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

  // 2. Continuous WhatsApp-style Live Location Polling (every 3.5s)
  useEffect(() => {
    const targetId = incident?.id || incidentId;
    if (!targetId) return;

    const pollLiveTelemetry = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/live-location?incidentId=${targetId}`);
        if (res.ok) {
          const d = await res.json();
          const bc = d.breadcrumbs || [];
          setBreadcrumbs(bc);

          const latest = bc[0] || d.location || (d.incident?.latitude ? d.incident : null);
          if (latest?.latitude && latest?.longitude) {
            setLiveCoords({ lat: Number(latest.latitude), lng: Number(latest.longitude) });
            setLiveSpeed(latest.speed !== undefined && latest.speed !== null ? Math.round(Number(latest.speed)) : null);
            setLiveHeading(latest.heading !== undefined && latest.heading !== null ? Math.round(Number(latest.heading)) : null);
            setLiveAccuracy(latest.accuracy !== undefined && latest.accuracy !== null ? Math.round(Number(latest.accuracy)) : null);
            setLastUpdateAt(new Date().toLocaleTimeString());
            setPingCount(bc.length);
          }
        }
      } catch (err) {
        console.warn('[SosIntercept] Live telemetry poll warning:', err);
      }
    };

    pollLiveTelemetry();
    liveRef.current = setInterval(pollLiveTelemetry, 3500);

    return () => {
      if (liveRef.current) clearInterval(liveRef.current);
    };
  }, [incident?.id, incidentId]);

  const effectiveLat = liveCoords?.lat ?? (incident?.latitude ? Number(incident.latitude) : 6.9388);
  const effectiveLng = liveCoords?.lng ?? (incident?.longitude ? Number(incident.longitude) : 3.6437);
  const effectiveAccuracy = liveAccuracy ?? (incident?.accuracy ? Math.round(Number(incident.accuracy)) : null);

  // Map tile & position calculation
  const tile = latLngToTile(effectiveLat, effectiveLng, 16);
  const offset = latLngToOffset(effectiveLat, effectiveLng, 16);
  const tileUrl = `https://tile.openstreetmap.org/16/${tile.x}/${tile.y}.png`;

  const mapsUrl = `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}&z=18`;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${effectiveLat},${effectiveLng}&travelmode=driving`;

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
        Alert.alert('✅ Status Updated', `Incident status set to: ${newStatus.toUpperCase()}`);
      }
    } catch {
      Alert.alert('Network Issue', 'Unable to update status. Check connectivity.');
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
          <Text style={styles.loadingText}>Acquiring SOS Tactical Telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text style={styles.loadingText}>Emergency incident not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTopBtn}>
            <Text style={styles.backTopBtnText}>← Back to Terminal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCodeRed = incident.threat_level === 'CODE_RED' || incident.category?.toLowerCase().includes('robbery') || incident.category?.toLowerCase().includes('terror');
  const statusColor =
    incident.status === 'resolved' ? '#22c55e'
    : incident.status === 'dispatched' ? '#3b82f6'
    : incident.status === 'investigating' ? '#f59e0b'
    : '#ef4444';

  return (
    <SafeAreaView style={styles.container}>
      {/* Officer Intercept Command Header */}
      <View style={[styles.header, { borderBottomColor: isCodeRed ? '#ef4444' : '#f59e0b' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: isCodeRed ? '#f87171' : '#fde047' }]} numberOfLines={1}>
            {isCodeRed ? '🚨 CODE RED INTERCEPT' : '⚠️ INCIDENT RADAR'} — {incident.id}
          </Text>
          <Text style={styles.headerSub}>Ogere Joint Patrol Taskforce Command</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '33', borderColor: statusColor }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>
            {(incident.status || 'OPEN').toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── 1. LIVE RADAR MAP (Like WhatsApp Live Location) ───────────── */}
        <View style={styles.mapCard}>
          {/* Radar Header */}
          <View style={styles.mapHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.livePulseDot} />
              <Text style={styles.mapHeaderTitle}>
                {incident.is_live_tracking ? 'LIVE TARGET RADAR · MOVING' : 'VICTIM GPS PIN'}
              </Text>
            </View>
            <Text style={styles.lastUpdateText}>
              {lastUpdateAt ? `Updated ${lastUpdateAt}` : 'Live GPS active'}
            </Text>
          </View>

          {/* Real Street Map Tile with Overlaid Victim Pin */}
          <View style={styles.mapFrame}>
            <Image
              source={{ uri: tileUrl }}
              style={styles.mapImage}
              resizeMode="cover"
            />

            {/* Tactical Grid Lines Overlay */}
            <View style={styles.tacticalGrid} pointerEvents="none" />

            {/* Victim Pulsing Radar Marker */}
            <View
              style={[
                styles.markerContainer,
                { left: `${offset.offsetX}%`, top: `${offset.offsetY}%` },
              ]}
              pointerEvents="none"
            >
              <View style={styles.markerRipple} />
              <View style={styles.markerCore}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
              <View style={styles.markerBadge}>
                <Text style={styles.markerBadgeText}>VICTIM</Text>
              </View>
            </View>

            {/* Watermark in bottom corner */}
            <View style={styles.mapWatermark}>
              <Text style={styles.mapWatermarkText}>OSM Street Radar · Ogere Remo</Text>
            </View>
          </View>

          {/* Telemetry Metrics Row */}
          <View style={styles.telemetryBar}>
            <View style={styles.telemetryCell}>
              <Text style={styles.telemetryCellLabel}>COORDINATES</Text>
              <Text style={styles.telemetryCellValue}>
                {effectiveLat.toFixed(5)}°N, {effectiveLng.toFixed(5)}°E
              </Text>
            </View>
            <View style={styles.telemetryCell}>
              <Text style={styles.telemetryCellLabel}>ACCURACY</Text>
              <Text style={[styles.telemetryCellValue, { color: effectiveAccuracy && effectiveAccuracy < 30 ? '#4ade80' : '#fde047' }]}>
                {effectiveAccuracy ? `±${effectiveAccuracy}m` : 'Satellite'}
              </Text>
            </View>
            <View style={styles.telemetryCell}>
              <Text style={styles.telemetryCellLabel}>SPEED</Text>
              <Text style={styles.telemetryCellValue}>
                {liveSpeed !== null ? `${liveSpeed} km/h` : 'Stationary'}
              </Text>
            </View>
            <View style={styles.telemetryCell}>
              <Text style={styles.telemetryCellLabel}>PINGS</Text>
              <Text style={styles.telemetryCellValue}>
                {pingCount > 0 ? `${pingCount} tracked` : 'Live'}
              </Text>
            </View>
          </View>

          {/* Quick Action Intercept Navigation Buttons */}
          <View style={styles.mapActionRow}>
            <TouchableOpacity
              style={styles.navActionBtn}
              onPress={() => Linking.openURL(navUrl).catch(() => Alert.alert('Maps', mapsUrl))}
            >
              <Text style={styles.navActionBtnText}>⚡ Intercept (Turn-by-Turn Navigation) ➔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pinActionBtn}
              onPress={() => Linking.openURL(mapsUrl).catch(() => Alert.alert('Maps', mapsUrl))}
            >
              <Text style={styles.pinActionBtnText}>🗺️ Open Full Google Maps Pin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 2. BREADCRUMBS PATH TRAIL (If movement detected) ─────────── */}
        {breadcrumbs.length > 1 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>
              🚶 MOVEMENT PATH TRAIL ({breadcrumbs.length} RECENT LOCATIONS)
            </Text>
            <View style={styles.trailList}>
              {breadcrumbs.slice(0, 5).map((b: any, idx: number) => (
                <View key={idx} style={styles.trailRow}>
                  <Text style={styles.trailIndex}>#{idx + 1}</Text>
                  <Text style={styles.trailCoords}>
                    {Number(b.latitude).toFixed(5)}°N, {Number(b.longitude).toFixed(5)}°E
                  </Text>
                  <Text style={styles.trailMeta}>
                    {b.speed ? `${b.speed} km/h · ` : ''}
                    {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 3. INCIDENT BRIEF & CATEGORY ─────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🚨 INCIDENT SITREP</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CATEGORY</Text>
            <Text style={styles.infoValue}>{incident.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>THREAT LEVEL</Text>
            <Text style={[styles.infoValue, { color: isCodeRed ? '#f87171' : '#fde047', fontWeight: '900' }]}>
              {incident.threat_level || (isCodeRed ? 'CODE_RED' : 'STANDARD')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SECTOR / LANDMARK</Text>
            <Text style={styles.infoValue}>{incident.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIME LOGGED</Text>
            <Text style={styles.infoValue}>
              {incident.created_at
                ? new Date(incident.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
                : 'Just now'}
            </Text>
          </View>

          {/* Full description */}
          <View style={styles.descBox}>
            <Text style={styles.descLabel}>CITIZEN SITREP DESCRIPTION</Text>
            <Text style={styles.descText}>{incident.description || 'No description provided.'}</Text>
          </View>
        </View>

        {/* ── 4. REPORTER CONTACT & CALL CONTROLS ─────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>👤 REPORTER DETAILS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NAME</Text>
            <Text style={styles.infoValue}>{incident.reporter_name || 'Anonymous Citizen'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE NUMBER</Text>
            <Text style={styles.infoValue}>{incident.reporter_phone || 'Unlisted'}</Text>
          </View>

          {incident.is_silent_panic ? (
            <View style={styles.silentPanicBox}>
              <Text style={styles.silentPanicText}>
                🤫 SILENT COVERT PANIC — Citizen may be held hostage or hiding. DO NOT SOUND SIRENS. Approach tactically.
              </Text>
            </View>
          ) : incident.reporter_phone && incident.reporter_phone !== 'N/A' && incident.reporter_phone !== 'Emergency Phone' ? (
            <TouchableOpacity
              style={styles.callReporterBtn}
              onPress={() => handleCall(incident.reporter_phone, incident.reporter_name)}
            >
              <Text style={styles.callReporterBtnText}>
                📞 Call Reporter Immediately: {incident.reporter_phone}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── 5. VICTIM DEVICE & SIGNAL INTELLIGENCE ──────────────────── */}
        {(incident.device_model || incident.device_os || incident.network_type || incident.battery_level != null || incident.ip_address) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>📱 DEVICE & SIGNAL INTELLIGENCE</Text>
            <View style={styles.deviceGrid}>
              {incident.device_model && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>DEVICE MODEL</Text>
                  <Text style={styles.deviceCellValue}>{incident.device_model}</Text>
                </View>
              )}
              {incident.device_os && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>OPERATING SYSTEM</Text>
                  <Text style={styles.deviceCellValue}>{incident.device_os}</Text>
                </View>
              )}
              {incident.battery_level != null && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>BATTERY LEVEL</Text>
                  <Text style={[styles.deviceCellValue, {
                    color: incident.battery_level > 20 ? '#4ade80' : '#ef4444',
                    fontWeight: '900',
                  }]}>
                    🔋 {incident.battery_level}% {incident.battery_level <= 20 ? '⚠️ LOW' : ''}
                  </Text>
                </View>
              )}
              {incident.network_type && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>NETWORK / CARRIER</Text>
                  <Text style={[styles.deviceCellValue, { color: '#38bdf8' }]}>
                    📶 {incident.network_type.toUpperCase()}
                    {incident.network_generation ? ` · ${incident.network_generation.toUpperCase()}` : ''}
                    {incident.carrier ? ` (${incident.carrier})` : ''}
                  </Text>
                </View>
              )}
              {incident.ip_address && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>PUBLIC IP ADDRESS</Text>
                  <Text style={[styles.deviceCellValue, { fontFamily: 'monospace' as any }]}>
                    🌐 {incident.ip_address}
                  </Text>
                </View>
              )}
              {incident.timezone && (
                <View style={styles.deviceCell}>
                  <Text style={styles.deviceCellLabel}>TIMEZONE</Text>
                  <Text style={styles.deviceCellValue}>🕒 {incident.timezone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── 6. RAPID EMERGENCY SPEED DIAL ───────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>📞 EMERGENCY BACKUP DISPATCH</Text>
          <View style={styles.dialGrid}>
            {EMERGENCY_PHONES.map(ep => (
              <TouchableOpacity
                key={ep.phone}
                style={styles.dialBtn}
                onPress={() => handleCall(ep.phone, ep.label)}
              >
                <Text style={{ fontSize: 16 }}>{ep.icon}</Text>
                <Text style={styles.dialBtnText}>{ep.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 7. OFFICER STATUS DISPATCH CONTROLS ─────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🔁 UPDATE INTERCEPT STATUS</Text>
          {updating && <ActivityIndicator color="#ef4444" style={{ marginBottom: 6 }} />}
          <View style={styles.statusBtnRow}>
            {[
              { id: 'dispatched', label: '🚔 DISPATCHED', color: '#3b82f6' },
              { id: 'investigating', label: '🔍 ON SCENE', color: '#f59e0b' },
              { id: 'resolved', label: '✅ RESOLVED', color: '#22c55e' },
            ].map(s => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.statusBtn,
                  incident.status === s.id && { backgroundColor: s.color + '22', borderColor: s.color },
                ]}
                onPress={() => handleUpdateStatus(s.id)}
                disabled={updating || incident.status === s.id}
              >
                <Text style={[styles.statusBtnText, { color: s.color }]}>{s.label}</Text>
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
  loadingText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#120904',
    borderBottomWidth: 2,
    gap: 10,
  },
  backBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
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
  headerSub: { color: '#64748b', fontSize: 10, marginTop: 1 },
  statusPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  statusPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  content: { padding: 12, gap: 12, paddingBottom: 40 },

  // Map Card
  mapCard: {
    backgroundColor: '#111111',
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: '#22c55e',
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(5, 46, 22, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: '#22c55e',
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  mapHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 0.8,
  },
  lastUpdateText: {
    fontSize: 10,
    color: '#86efac',
    fontWeight: '700',
  },

  // Map Frame & Image
  mapFrame: {
    height: 230,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  tacticalGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },

  // Marker
  markerContainer: {
    position: 'absolute',
    marginLeft: -16,
    marginTop: -32,
    alignItems: 'center',
  },
  markerRipple: {
    position: 'absolute',
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  markerCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  markerEmoji: { fontSize: 16 },
  markerBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  markerBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  mapWatermark: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapWatermarkText: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },

  // Telemetry Bar
  telemetryBar: {
    flexDirection: 'row',
    backgroundColor: '#0d1520',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  telemetryCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  telemetryCellLabel: { fontSize: 7, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },
  telemetryCellValue: { fontSize: 10, fontWeight: '800', color: '#ffffff', marginTop: 2, textAlign: 'center' },

  // Map Action Buttons
  mapActionRow: { padding: 10, gap: 8 },
  navActionBtn: {
    backgroundColor: '#16a34a',
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  navActionBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  pinActionBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  pinActionBtnText: { color: '#93c5fd', fontSize: 12, fontWeight: '800' },

  // Section Cards
  sectionCard: {
    backgroundColor: '#111111',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  // Trail
  trailList: { gap: 4 },
  trailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0f18',
    padding: 6,
    borderRadius: 4,
  },
  trailIndex: { fontSize: 9, fontWeight: '800', color: Colors.gold, width: 24 },
  trailCoords: { fontSize: 10, fontWeight: '700', color: '#e2e8f0', flex: 1, fontFamily: 'monospace' as any },
  trailMeta: { fontSize: 9, color: '#86efac' },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', width: 110 },
  infoValue: { fontSize: 11, fontWeight: '700', color: '#e2e8f0', flex: 1, textAlign: 'right' },

  descBox: { backgroundColor: '#0a0f18', borderRadius: 6, padding: 10, marginTop: 4 },
  descLabel: { fontSize: 8, fontWeight: '900', color: '#475569', letterSpacing: 0.5, marginBottom: 4 },
  descText: { fontSize: 12, color: '#cbd5e1', lineHeight: 18 },

  // Call reporter button
  callReporterBtn: {
    backgroundColor: '#166534',
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
    marginTop: 4,
  },
  callReporterBtnText: { color: '#4ade80', fontSize: 12, fontWeight: '900' },
  silentPanicBox: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    padding: 8,
    marginTop: 4,
  },
  silentPanicText: { color: '#fca5a5', fontSize: 10, fontWeight: '800', lineHeight: 15 },

  // Device Intel
  deviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deviceCell: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: '#0a0f18',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deviceCellLabel: { fontSize: 7, fontWeight: '900', color: '#64748b', letterSpacing: 0.5, marginBottom: 2 },
  deviceCellValue: { fontSize: 10, fontWeight: '700', color: '#cbd5e1' },

  // Emergency Dial
  dialGrid: { gap: 6 },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#160d07',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.25)',
    borderRadius: Radius.sm,
    padding: 9,
  },
  dialBtnText: { color: '#f5edd8', fontSize: 11, fontWeight: '700' },

  // Status buttons
  statusBtnRow: { flexDirection: 'row', gap: 6 },
  statusBtn: {
    flex: 1,
    backgroundColor: '#0a0f18',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: Radius.sm,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statusBtnText: { fontSize: 10, fontWeight: '900' },
});
