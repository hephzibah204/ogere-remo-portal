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
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';
import { resolveOgereLocation, getOgereMapUrls } from '../../services/ogereGeoEngine';

function latLngToTile(lat: number, lng: number, zoom = 16) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, zoom };
}

function latLngToOffset(lat: number, lng: number, zoom = 16) {
  const n = Math.pow(2, zoom);
  const xExact = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yExact = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const offsetX = Math.max(5, Math.min(95, Math.round((xExact - Math.floor(xExact)) * 100)));
  const offsetY = Math.max(5, Math.min(95, Math.round((yExact - Math.floor(yExact)) * 100)));
  return { offsetX, offsetY };
}

function formatDuration(seconds: number) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const WalkWithMeMonitorScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const [escorts, setEscorts] = useState<any[]>([]);
  const [selectedEscortId, setSelectedEscortId] = useState<string>(route?.params?.escortId || '');
  const [selectedEscort, setSelectedEscort] = useState<any>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(900); // 15 mins default
  const [resolvingCodeRed, setResolvingCodeRed] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch active escorts list
  const fetchEscortsList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/escort`);
      if (res.ok) {
        const data = await res.json();
        const list = data.escorts || [];
        setEscorts(list);
        if (!selectedEscortId && list.length > 0) {
          setSelectedEscortId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('[WalkWithMeMonitor] Escorts list fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Fetch specific escort details and breadcrumbs
  const fetchEscortDetails = async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/escort?escortId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.escort) {
          setSelectedEscort(data.escort);
          setBreadcrumbs(data.breadcrumbs || []);
          setLastPingTime(new Date().toLocaleTimeString());

          // Calculate remaining countdown seconds
          if (data.escort.expires_at) {
            const exp = new Date(data.escort.expires_at).getTime();
            const now = Date.now();
            setCountdown(Math.max(0, Math.floor((exp - now) / 1000)));
          }
        }
      }
    } catch (err) {
      console.warn('[WalkWithMeMonitor] Escort detail fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEscortsList();
  }, []);

  useEffect(() => {
    if (selectedEscortId) {
      fetchEscortDetails(selectedEscortId);

      // Start live polling every 4 seconds
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchEscortDetails(selectedEscortId);
      }, 4000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedEscortId]);

  // Local countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effective coordinates for current citizen
  const effectiveLat = selectedEscort?.last_latitude ? Number(selectedEscort.last_latitude) : 6.9372;
  const effectiveLng = selectedEscort?.last_longitude ? Number(selectedEscort.last_longitude) : 3.6335;
  const effectiveAcc = selectedEscort?.accuracy ? Math.round(Number(selectedEscort.accuracy)) : 5;
  const effectiveSpeed = selectedEscort?.speed != null ? Math.round(Number(selectedEscort.speed) * 3.6) : 0; // km/h
  const effectiveHeading = selectedEscort?.heading != null ? Math.round(Number(selectedEscort.heading)) : null;
  const effectiveBattery = selectedEscort?.battery_level != null ? selectedEscort.battery_level : 85;
  const isCharging = selectedEscort?.is_charging ?? false;

  // Local Ogere landmark resolution
  const geoResolution = resolveOgereLocation(effectiveLat, effectiveLng, effectiveAcc);
  const mapUrls = getOgereMapUrls(effectiveLat, effectiveLng, selectedEscort?.destination || 'Ogere Remo');

  // Slippy map tile
  const tile = latLngToTile(effectiveLat, effectiveLng, 16);
  const offset = latLngToOffset(effectiveLat, effectiveLng, 16);
  const tileUrl = `https://tile.openstreetmap.org/16/${tile.x}/${tile.y}.png`;

  const isOverdue = countdown <= 0 && selectedEscort?.status === 'active';
  const isDuress = selectedEscort?.status === 'duress_triggered';
  const isSafe = selectedEscort?.status === 'safe_arrival';

  const handleTriggerRescue = async () => {
    Alert.alert(
      '🚨 TRIGGER CODE RED RESCUE',
      `Dispatch armed police and vigilante intercept squad to ${selectedEscort?.destination || 'citizen location'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH RESCUE',
          style: 'destructive',
          onPress: async () => {
            setResolvingCodeRed(true);
            try {
              const res = await fetch(`${API_BASE_URL}/api/incidents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  category: '🚷 Walk With Me Emergency Intercept',
                  threat_level: 'CODE_RED',
                  severity: 'Critical',
                  location: selectedEscort?.destination || geoResolution.formattedText,
                  latitude: effectiveLat,
                  longitude: effectiveLng,
                  description: `OFFICER TRIGGERED CODE RED for Walk With Me session ${selectedEscort?.id}. Citizen: ${selectedEscort?.user_id || 'Citizen'}. Destination: ${selectedEscort?.destination}. Immediate tactical backup requested.`,
                  assigned_agency: 'Police / SWAT Rapid Response',
                  reporter_name: 'Security Guard Tactical Monitor',
                }),
              });
              if (res.ok) {
                Alert.alert('🚨 CODE RED DISPATCHED', 'Armed tactical patrol units have been alerted to intercept coordinates.');
                fetchEscortsList();
              }
            } catch {
              Alert.alert('Dispatch Warning', 'Failed to push distress alert over network. Dial DPO directly.');
            } finally {
              setResolvingCodeRed(false);
            }
          },
        },
      ]
    );
  };

  const handleCallCitizen = () => {
    const phone = selectedEscort?.phone || '08081762371';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Dial citizen directly at ${phone}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>WALK WITH ME MONITOR</Text>
          <Text style={styles.headerSub}>Tactical Safe Escort · Real-Time Radar</Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>
            {escorts.length} ACTIVE
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEscortsList();
              if (selectedEscortId) fetchEscortDetails(selectedEscortId);
            }}
            tintColor={Colors.gold}
          />
        }
      >
        {/* Active Escorts Carousel / Selector */}
        {escorts.length > 0 && (
          <View style={styles.selectorContainer}>
            <Text style={styles.sectionLabel}>ACTIVE CITIZEN SESSIONS ({escorts.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {escorts.map((esc) => {
                const isSelected = esc.id === selectedEscortId;
                const activeDuress = esc.status === 'duress_triggered';
                const activeOverdue = esc.status === 'overdue';
                return (
                  <TouchableOpacity
                    key={esc.id}
                    onPress={() => setSelectedEscortId(esc.id)}
                    style={[
                      styles.escortChip,
                      isSelected && styles.escortChipSelected,
                      (activeDuress || activeOverdue) && styles.escortChipAlert,
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14 }}>
                        {activeDuress ? '🚨' : activeOverdue ? '⚠️' : '🚶‍♂️'}
                      </Text>
                      <Text style={[styles.escortChipTitle, isSelected && { color: '#ffffff' }]}>
                        {esc.user_id || 'Citizen'}
                      </Text>
                    </View>
                    <Text style={styles.escortChipDest} numberOfLines={1}>
                      ➔ {esc.destination || 'Destination'}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={styles.escortChipId}>{esc.id}</Text>
                      {esc.battery_level != null && (
                        <Text style={styles.escortChipBattery}>🔋 {esc.battery_level}%</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Syncing Ogere Satellite Escort Grid...</Text>
          </View>
        ) : !selectedEscort ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Active Escort Sessions</Text>
            <Text style={styles.emptySub}>
              When citizens initiate "Walk With Me" in Ogere Remo, their satellite telemetry, destination and battery level appear here live.
            </Text>
            <TouchableOpacity onPress={fetchEscortsList} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>🔄 Refresh Sentinel Grid</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Status Alert Banner */}
            {(isDuress || isOverdue) && (
              <View style={[styles.alertBanner, { backgroundColor: isDuress ? '#dc2626' : '#ea580c' }]}>
                <Text style={styles.alertBannerIcon}>🚨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertBannerTitle}>
                    {isDuress ? 'COVERT DURESS TRIGGERED (PIN 9999)' : 'CHECK-IN WINDOW OVERDUE'}
                  </Text>
                  <Text style={styles.alertBannerSub}>
                    {isDuress
                      ? 'Citizen silently flagged a hostage situation. Suspects may be near.'
                      : 'Citizen did not verify safety arrival PIN. Respond to coordinates immediately.'}
                  </Text>
                </View>
              </View>
            )}

            {isSafe && (
              <View style={[styles.alertBanner, { backgroundColor: '#16a34a' }]}>
                <Text style={styles.alertBannerIcon}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertBannerTitle}>SAFELY ARRIVED</Text>
                  <Text style={styles.alertBannerSub}>
                    Citizen reached destination and entered safe arrival PIN.
                  </Text>
                </View>
              </View>
            )}

            {/* Check-In Window Countdown Strip */}
            <View style={styles.timerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timerLabel}>CHECK-IN TIMEOUT CLOCK</Text>
                <Text style={[styles.timerValue, isOverdue && { color: '#ef4444' }]}>
                  {isOverdue ? 'EXPIRED' : `⏳ ${formatDuration(countdown)}`}
                </Text>
              </View>
              <View style={styles.timerRight}>
                <Text style={styles.timerSub}>Destination:</Text>
                <Text style={styles.destText} numberOfLines={2}>
                  🏁 {selectedEscort.destination || 'Designated Safe Zone'}
                </Text>
              </View>
            </View>

            {/* Tactical Radar Map Card */}
            <View style={styles.mapCard}>
              <View style={styles.mapHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.radarPulse} />
                  <Text style={styles.mapTitle}>OGERE TACTICAL RADAR (SLIPPY TILE)</Text>
                </View>
                <Text style={styles.mapCoords}>
                  {effectiveLat.toFixed(5)}°N, {effectiveLng.toFixed(5)}°E
                </Text>
              </View>

              {/* Map Tile Canvas */}
              <View style={styles.mapCanvas}>
                <Image
                  source={{ uri: tileUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />

                {/* Radar Grid Overlay */}
                <View style={styles.radarGridLines} />

                {/* Citizen Live Pin with Animated Wave */}
                <View
                  style={[
                    styles.citizenPinContainer,
                    { left: `${offset.offsetX}%`, top: `${offset.offsetY}%` },
                  ]}
                >
                  <View style={styles.pulseRing} />
                  <View style={styles.pinBubble}>
                    <Text style={{ fontSize: 15 }}>🚶‍♂️</Text>
                  </View>
                  <View style={styles.pinTag}>
                    <Text style={styles.pinTagText}>{selectedEscort.user_id || 'Citizen'}</Text>
                  </View>
                </View>

                {/* Destination Flag if nearby */}
                <View style={styles.destFlagContainer}>
                  <Text style={styles.destFlagText}>🏁 {selectedEscort.destination || 'Arrival'}</Text>
                </View>

                {/* Live Telemetry Floating Pill */}
                <View style={styles.floatingPill}>
                  <Text style={styles.floatingPillText}>
                    📡 30 FPS · GPS ±{effectiveAcc}m · {effectiveSpeed} km/h
                  </Text>
                </View>
              </View>

              {/* Landmark HUD Bar */}
              <View style={styles.landmarkHud}>
                <Text style={styles.landmarkIcon}>🏛️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.landmarkTitle}>{geoResolution.landmark}</Text>
                  <Text style={styles.landmarkSub}>{geoResolution.formattedText}</Text>
                </View>
                {geoResolution.policeEtaMinutes != null && (
                  <View style={styles.etaBadge}>
                    <Text style={styles.etaBadgeTitle}>POLICE ETA</Text>
                    <Text style={styles.etaBadgeVal}>~{geoResolution.policeEtaMinutes} min</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Real-Time Telemetry Matrix */}
            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryHeader}>CITIZEN HARDWARE TELEMETRY</Text>
              <View style={styles.telemetryGrid}>
                {/* Physical Battery */}
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>BATTERY LEVEL</Text>
                  <Text
                    style={[
                      styles.telemetryVal,
                      { color: effectiveBattery > 30 ? '#4ade80' : '#f87171' },
                    ]}
                  >
                    🔋 {effectiveBattery}% {isCharging ? '⚡' : ''}
                  </Text>
                  <Text style={styles.telemetrySubVal}>
                    {isCharging ? 'Charging via Power' : effectiveBattery > 20 ? 'Sufficient' : 'LOW POWER'}
                  </Text>
                </View>

                {/* Walking Speed */}
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>SPEED & PACE</Text>
                  <Text style={[styles.telemetryVal, { color: '#38bdf8' }]}>
                    {effectiveSpeed} km/h
                  </Text>
                  <Text style={styles.telemetrySubVal}>
                    {effectiveSpeed < 1 ? 'Stationary' : effectiveSpeed < 8 ? 'Walking / Jog' : 'Vehicle In Motion'}
                  </Text>
                </View>

                {/* GPS Precision */}
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>GPS ACCURACY</Text>
                  <Text
                    style={[
                      styles.telemetryVal,
                      { color: effectiveAcc <= 10 ? '#4ade80' : '#facc15' },
                    ]}
                  >
                    ±{effectiveAcc} meters
                  </Text>
                  <Text style={styles.telemetrySubVal}>
                    {effectiveAcc <= 5 ? 'Satellite Lock (Precise)' : 'Cell / Wi-Fi Blend'}
                  </Text>
                </View>

                {/* Compass Heading */}
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>BEARING / COMPASS</Text>
                  <Text style={[styles.telemetryVal, { color: '#c084fc' }]}>
                    {effectiveHeading != null ? `${effectiveHeading}°` : 'N/A'}
                  </Text>
                  <Text style={styles.telemetrySubVal}>
                    {geoResolution.bearingFromLandmark}
                  </Text>
                </View>
              </View>

              {lastPingTime ? (
                <View style={styles.pingTimestampRow}>
                  <Text style={styles.pingTimestampText}>
                    🟢 Live Signal Active · Last Heartbeat: {lastPingTime} · {breadcrumbs.length} breadcrumbs recorded
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Tactical Intercept & Navigation Action Bar */}
            <View style={styles.actionsContainer}>
              {/* Button 1: Turn by turn navigation */}
              <TouchableOpacity
                onPress={() => Linking.openURL(mapUrls.turnByTurnNavigation)}
                style={styles.primaryActionBtn}
              >
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.primaryActionTitle}>
                    INTERCEPT & ESCORT (TURN-BY-TURN)
                  </Text>
                  <Text style={styles.primaryActionSub}>
                    Open Google Maps Driving Directions to citizen
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>

              {/* Button 2: Rooftop Satellite Pin */}
              <TouchableOpacity
                onPress={() => Linking.openURL(mapUrls.satellitePin)}
                style={styles.secondaryActionBtn}
              >
                <Text style={{ fontSize: 18 }}>🛰️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.secondaryActionTitle}>
                    ROOFTOP SATELLITE PIN (Z:19)
                  </Text>
                  <Text style={styles.secondaryActionSub}>
                    Inspect exact building, compound & street alleyway
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>

              {/* Direct Call & Emergency Grid */}
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleCallCitizen} style={styles.callCitizenBtn}>
                  <Text style={styles.callCitizenText}>📞 Call Citizen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTriggerRescue}
                  disabled={resolvingCodeRed}
                  style={styles.triggerRescueBtn}
                >
                  <Text style={styles.triggerRescueText}>
                    {resolvingCodeRed ? 'DISPATCHING...' : '🚨 Trigger Armed CODE RED'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Breadcrumb Trail Log */}
            {breadcrumbs.length > 0 && (
              <View style={styles.breadcrumbCard}>
                <Text style={styles.breadcrumbTitle}>
                  🛰️ RECENT GPS BREADCRUMBS ({breadcrumbs.length})
                </Text>
                <View style={styles.breadcrumbList}>
                  {breadcrumbs.slice(0, 5).map((p, idx) => (
                    <View key={p.id || idx} style={styles.breadcrumbRow}>
                      <Text style={styles.breadcrumbDot}>•</Text>
                      <Text style={styles.breadcrumbCoords}>
                        {Number(p.latitude).toFixed(5)}°N, {Number(p.longitude).toFixed(5)}°E
                      </Text>
                      {p.accuracy && (
                        <Text style={styles.breadcrumbAcc}>±{Math.round(p.accuracy)}m</Text>
                      )}
                      <Text style={styles.breadcrumbTime}>
                        {new Date(p.created_at || Date.now()).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: '#1e293b',
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    borderColor: '#38bdf8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  activeBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  selectorContainer: {
    gap: 6,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  selectorScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  escortChip: {
    backgroundColor: '#1e293b',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 140,
  },
  escortChipSelected: {
    borderColor: Colors.gold,
    backgroundColor: '#273549',
  },
  escortChipAlert: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  escortChipTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
  },
  escortChipDest: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  escortChipId: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  escortChipBattery: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '800',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#111827',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  refreshBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    gap: 10,
  },
  alertBannerIcon: {
    fontSize: 24,
  },
  alertBannerTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  alertBannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  timerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131d31',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: Radius.md,
    padding: 12,
  },
  timerLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerValue: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  timerRight: {
    alignItems: 'flex-end',
    maxWidth: '55%',
  },
  timerSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  destText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: '#0f172a',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#131d31',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  radarPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  mapTitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mapCoords: {
    color: '#94a3b8',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  mapCanvas: {
    height: 220,
    backgroundColor: '#1e293b',
    position: 'relative',
    overflow: 'hidden',
  },
  radarGridLines: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.15)',
  },
  citizenPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  pinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284c7',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pinTag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  pinTagText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  destFlagContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  destFlagText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  floatingPillText: {
    color: '#94a3b8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  landmarkHud: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#131d31',
    gap: 8,
  },
  landmarkIcon: {
    fontSize: 20,
  },
  landmarkTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  landmarkSub: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 1,
  },
  etaBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  etaBadgeTitle: {
    color: '#4ade80',
    fontSize: 7,
    fontWeight: '800',
  },
  etaBadgeVal: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  telemetryCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    gap: 10,
  },
  telemetryHeader: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  telemetryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a2333',
    padding: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#263346',
  },
  telemetryLabel: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '800',
  },
  telemetryVal: {
    fontSize: 13,
    fontWeight: '900',
    marginVertical: 2,
    fontFamily: 'monospace',
  },
  telemetrySubVal: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
  },
  pingTimestampRow: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  pingTimestampText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 8,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  primaryActionTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  primaryActionSub: {
    color: '#bfdbfe',
    fontSize: 10,
    marginTop: 2,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  secondaryActionTitle: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
  },
  secondaryActionSub: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 2,
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  callCitizenBtn: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCitizenText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  triggerRescueBtn: {
    flex: 1.2,
    backgroundColor: '#dc2626',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerRescueText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  breadcrumbCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    gap: 8,
  },
  breadcrumbTitle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  breadcrumbList: {
    gap: 4,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbDot: {
    color: '#38bdf8',
    fontSize: 14,
  },
  breadcrumbCoords: {
    color: '#e2e8f0',
    fontSize: 9,
    fontFamily: 'monospace',
    flex: 1,
  },
  breadcrumbAcc: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '700',
  },
  breadcrumbTime: {
    color: '#64748b',
    fontSize: 8,
  },
});
