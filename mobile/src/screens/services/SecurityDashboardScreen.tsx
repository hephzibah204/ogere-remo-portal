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
import * as Haptics from 'expo-haptics';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { syncManager, API_BASE_URL } from '../../database/syncManager';

const AGENCIES = [
  { id: 'all', name: 'All Agencies', icon: '🌐' },
  { id: 'Police', name: 'Police (DPO)', icon: '🚔' },
  { id: 'FRSC', name: 'FRSC Rescue', icon: '🚦' },
  { id: 'So-Safe', name: 'So-Safe Corps', icon: '🛡️' },
  { id: 'Palace Vigilante', name: 'Palace Watch', icon: '👑' },
];

export const SecurityDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const alarmActiveRef = useRef(false);   // track if CODE_RED alarm is running
  const alertedIncidentsRef = useRef<Set<string>>(new Set()); // track acknowledged incident IDs
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trigger repeating haptic + vibration pattern for CODE_RED
  const triggerHapticAlarm = (newCodeRedIds: string[]) => {
    // Vibration pattern: 200ms on, 100ms off × 6 = 1.8s burst
    const pattern = [0, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200];
    Vibration.vibrate(pattern, false);

    // Also trigger heavy haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});

    if (newCodeRedIds.length > 0 && !alarmActiveRef.current) {
      alarmActiveRef.current = true;
      newCodeRedIds.forEach(id => alertedIncidentsRef.current.add(id));

      Alert.alert(
        '🚨 CODE RED — ARMED INCIDENT',
        'Active emergency detected in your sector. Tactical patrol units notified.',
        [{ text: 'ACKNOWLEDGED', style: 'destructive', onPress: () => { alarmActiveRef.current = false; } }],
        { cancelable: true, onDismiss: () => { alarmActiveRef.current = false; } }
      );
    }
  };

  const stopHapticAlarm = () => {
    Vibration.cancel();
    alarmActiveRef.current = false;
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const fetchIncidents = async () => {
    try {
      let url = `${API_BASE_URL}/api/incidents?limit=40`;
      if (selectedAgency !== 'all') {
        url += `&agency=${encodeURIComponent(selectedAgency)}`;
      }
      const res = await fetch(url).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const incoming = data.incidents || [];
        setIncidents(incoming);

        // Find any unacknowledged CODE_RED incidents
        const newCodeReds = incoming
          .filter((i: any) => i.threat_level === 'CODE_RED' && i.status !== 'resolved')
          .map((i: any) => i.id)
          .filter((id: string) => !alertedIncidentsRef.current.has(id));

        const hasActiveCodeRed = incoming.some(
          (i: any) => i.threat_level === 'CODE_RED' && i.status !== 'resolved'
        );

        if (newCodeReds.length > 0) {
          triggerHapticAlarm(newCodeReds);
        } else if (!hasActiveCodeRed) {
          stopHapticAlarm();
        }
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => {
      clearInterval(interval);
      stopHapticAlarm();
    };
  }, [selectedAgency]);


  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/incidents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          respondingUnit: 'Mobile Patrol Unit',
        }),
      });
      fetchIncidents();
    } catch {
      Alert.alert('Network Issue', 'Unable to update status to server.');
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Unable to dial', phone);
    });
  };

  const codeRedCount = incidents.filter(
    i => (i.threat_level === 'CODE_RED' || i.category?.toLowerCase().includes('robbery') || i.category?.toLowerCase().includes('terror')) && i.status !== 'resolved'
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="SECURITY COMMAND" subtitle="Patrol Dispatch Console" />

      {/* Code Red Banner */}
      <View
        style={[
          styles.statusBanner,
          codeRedCount > 0 ? styles.bannerRed : styles.bannerGreen,
        ]}
      >
        <Text style={styles.bannerEmoji}>{codeRedCount > 0 ? '🚨' : '🛡️'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>
            {codeRedCount > 0
              ? `${codeRedCount} ACTIVE CODE RED (ARMED/TERROR)`
              : 'SECTOR PATROL: NORMAL'}
          </Text>
          <Text style={styles.bannerSub}>
            Lagos-Ibadan Expressway Corridor · Joint Taskforce
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            fetchIncidents();
          }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshText}>{refreshing ? '...' : '⟳'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Civic Hub</Text>
        </TouchableOpacity>

        {/* Agency Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.agencyScroll}
        >
          {AGENCIES.map(ag => {
            const isSelected = selectedAgency === ag.id;
            return (
              <TouchableOpacity
                key={ag.id}
                onPress={() => setSelectedAgency(ag.id)}
                style={[styles.agencyChip, isSelected && styles.agencyChipActive]}
              >
                <Text style={styles.agencyChipEmoji}>{ag.icon}</Text>
                <Text
                  style={[
                    styles.agencyChipText,
                    isSelected && styles.agencyChipTextActive,
                  ]}
                >
                  {ag.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Incidents List */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : incidents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🟢</Text>
            <Text style={styles.emptyTitle}>All Sectors Clear</Text>
            <Text style={styles.emptySub}>No active emergency reports in this category.</Text>
          </View>
        ) : (
          incidents.map(inc => {
            const isCodeRed = inc.threat_level === 'CODE_RED' || inc.category?.toLowerCase().includes('robbery') || inc.category?.toLowerCase().includes('terror');
            const isSilent = inc.is_silent_panic;

            return (
              <Card
                key={inc.id}
                style={[
                  styles.incidentCard,
                  isCodeRed && styles.cardCodeRed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={[
                        styles.badge,
                        isCodeRed ? styles.badgeRed : styles.badgeYellow,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {isCodeRed ? '🚨 CODE RED' : '⚠️ HAZARD'}
                      </Text>
                    </View>
                    {isSilent && (
                      <View style={styles.silentBadge}>
                        <Text style={styles.silentBadgeText}>🤫 SILENT PANIC</Text>
                      </View>
                    )}
                    {inc.is_live_tracking && (
                      <View style={styles.liveRadarBadge}>
                        <Text style={styles.liveRadarBadgeText}>🟢 LIVE RADAR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.incidentStatus}>● {inc.status}</Text>
                </View>

                <Text style={styles.categoryTitle}>{inc.category}</Text>
                <Text style={styles.descText}>{inc.description}</Text>

                {/* Live Movement Telemetry HUD if in real-time live radar */}
                {inc.is_live_tracking && (
                  <View style={styles.liveMovementHud}>
                    <Text style={styles.liveMovementTitle}>
                      🟢 MOVING TARGET · {inc.speed !== null && inc.speed !== undefined ? `${inc.speed} km/h` : 'Moving'}
                      {inc.heading ? ` · Heading ${Math.round(inc.heading)}°` : ''}
                    </Text>
                    <Text style={styles.liveMovementSub}>
                      Live GPS: {Number(inc.latitude).toFixed(5)}°N, {Number(inc.longitude).toFixed(5)}°E
                      {inc.last_ping_at && ` · Updated: ${new Date(inc.last_ping_at).toLocaleTimeString()}`}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.locationText}>📍 {inc.location}</Text>
                  <Text style={styles.timeText}>
                    🕒 {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {/* Telemetry: Reporter IP & GPS Precision */}
                {(inc.ip_address || inc.accuracy || (inc.latitude && inc.longitude)) && (
                  <View style={styles.telemetryCard}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {inc.latitude && inc.longitude && (
                        <Text style={styles.telemetryItem}>
                          🎯 GPS: <Text style={styles.telemetryBold}>{Number(inc.latitude).toFixed(5)}°N, {Number(inc.longitude).toFixed(5)}°E</Text>
                        </Text>
                      )}
                      {inc.accuracy && (
                        <Text style={styles.telemetryItem}>
                          📏 Accuracy: <Text style={styles.telemetryBold}>±{Math.round(inc.accuracy)}m</Text>
                        </Text>
                      )}
                      {inc.ip_address && (
                        <Text style={styles.telemetryItem}>
                          🌐 Reporter IP: <Text style={styles.telemetryBold}>{inc.ip_address}</Text>
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Open incident GPS location in Google Maps / Turn-by-Turn Intercept */}
                {inc.latitude && inc.longitude && (
                  <TouchableOpacity
                    onPress={() => {
                      const url = inc.is_live_tracking
                        ? `https://www.google.com/maps/dir/?api=1&destination=${inc.latitude},${inc.longitude}`
                        : (inc.google_maps_url || `https://www.google.com/maps?q=${inc.latitude},${inc.longitude}&z=18`);
                      Linking.openURL(url).catch(() => Alert.alert('Maps unavailable', 'Install Google Maps to view location.'));
                    }}
                    style={[styles.mapBtn, inc.is_live_tracking && styles.interceptBtn]}
                  >
                    <Text style={[styles.mapBtnText, inc.is_live_tracking && styles.interceptBtnText]}>
                      {inc.is_live_tracking
                        ? '⚡ Intercept Moving Target (Google Maps Navigation)'
                        : '🗺️ Open Exact Pin on Google Maps'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* View Full Tactical SOS Radar Screen */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('SosIntercept', { incident: inc })}
                  style={styles.radarScreenBtn}
                >
                  <Text style={styles.radarScreenBtnText}>
                    🚨 View Full Tactical SOS Radar & Live Intel ➔
                  </Text>
                </TouchableOpacity>

                {inc.reporter_phone && (
                  <TouchableOpacity
                    onPress={() => handleCall(inc.reporter_phone)}
                    style={styles.callReporterBtn}
                  >
                    <Text style={styles.callReporterText}>
                      📞 Call Reporter: {inc.reporter_phone} ({inc.reporter_name || 'Citizen'})
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Dispatch action buttons */}
                <View style={styles.actionsRow}>
                  {inc.status === 'open' && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(inc.id, 'dispatched')}
                      style={styles.dispatchBtn}
                    >
                      <Text style={styles.actionBtnText}>🚀 Dispatch Patrol</Text>
                    </TouchableOpacity>
                  )}

                  {inc.status === 'dispatched' && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(inc.id, 'on_scene')}
                      style={styles.onSceneBtn}
                    >
                      <Text style={styles.actionBtnText}>📍 On Scene</Text>
                    </TouchableOpacity>
                  )}

                  {inc.status !== 'resolved' && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(inc.id, 'resolved')}
                      style={styles.resolveBtn}
                    >
                      <Text style={styles.actionBtnText}>✓ Secured</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: 12,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 10,
  },
  bannerRed: {
    backgroundColor: '#b91c1c',
  },
  bannerGreen: {
    backgroundColor: '#166534',
  },
  bannerEmoji: {
    fontSize: 22,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 1,
  },
  refreshBtn: {
    padding: 6,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  agencyScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  agencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  agencyChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  agencyChipEmoji: {
    fontSize: 14,
  },
  agencyChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  agencyChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  incidentCard: {
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
  },
  cardCodeRed: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeRed: {
    backgroundColor: '#dc2626',
  },
  badgeYellow: {
    backgroundColor: '#d97706',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  silentBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  silentBadgeText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '900',
  },
  incidentStatus: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  callReporterBtn: {
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  callReporterText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '700',
  },
  mapBtn: {
    backgroundColor: '#1a3a6e',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 9,
    borderRadius: Radius.sm,
    marginTop: 4,
    alignItems: 'center',
  },
  mapBtnText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 8,
  },
  dispatchBtn: {
    flex: 1,
    backgroundColor: '#d97706',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  onSceneBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  resolveBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  liveRadarBadge: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveRadarBadgeText: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveMovementHud: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: Radius.sm,
    padding: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  liveMovementTitle: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '900',
  },
  liveMovementSub: {
    color: '#bbf7d0',
    fontSize: 10,
    marginTop: 2,
  },
  interceptBtn: {
    backgroundColor: '#166534',
    borderColor: '#22c55e',
    borderWidth: 1.5,
  },
  interceptBtnText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  telemetryCard: {
    backgroundColor: '#0f172a',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#38bdf8',
    padding: 8,
    marginVertical: 4,
  },
  telemetryItem: {
    fontSize: 10,
    color: '#94a3b8',
  },
  telemetryBold: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  radarScreenBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  radarScreenBtnText: {
    color: '#fca5a5',
    fontWeight: '900',
    fontSize: 12,
  },
});
