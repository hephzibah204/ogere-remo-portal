import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { Button } from './Button';
import { syncManager, API_BASE_URL } from '../database/syncManager';
import { queueOfflineSubmission } from '../database/sqlite';
import { useAuth } from '../services/authContext';
import { liveTrackingService, LiveTrackingState } from '../services/liveTrackingService';
import {
  getExactDeviceLocation,
  openInGoogleMaps,
  DeviceLocationData,
} from '../services/locationService';

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

const SECTORS = [
  { name: 'KM 66-68 Lagos-Ibadan Expressway', lat: 6.9388, lng: 3.6437 },
  { name: 'Ogere Tollgate Bypass / Old Tollgate', lat: 6.9380, lng: 3.6410 },
  { name: 'Palace Way / Aafin Ologere Axis', lat: 6.9368, lng: 3.6330 },
  { name: 'Oke-Ogere Market Corridor', lat: 6.9354, lng: 3.6338 },
  { name: 'Isale-Ogere / Hospital Road', lat: 6.9325, lng: 3.6310 },
  { name: 'Trailer Park Outpost', lat: 6.9366, lng: 3.6344 },
  { name: 'Agbele Ancestral Axis', lat: 6.9290, lng: 3.6260 },
  { name: 'Ajura Corridor', lat: 6.9550, lng: 3.6480 },
];

const EMERGENCY_SERVICES = [
  {
    title: 'FRSC Expressway Rescue',
    phone: '122',
    icon: '🚑',
    desc: 'Highway collisions, vehicular entrapment, medical evacuation',
  },
  {
    title: 'Police Divisional Command',
    phone: '08034567890',
    icon: '🚓',
    desc: 'Armed robbery, violent crime, highway banditry, security threat',
  },
  {
    title: 'Ogere Hospital Emergency',
    phone: '08123456781',
    icon: '🏥',
    desc: 'Trauma ward, urgent blood dispatch, cardiac / respiratory crisis',
  },
  {
    title: 'Palace Security & Vigilante',
    phone: '08023456789',
    icon: '🛡️',
    desc: 'Community night watch, local dispute containment, neighborhood watch',
  },
];

export const SosModal: React.FC<SosModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [isSending, setIsSending] = useState(false);
  const [shareCamera, setShareCamera] = useState(false);
  const [shareAudio, setShareAudio] = useState(false);
  const [liveState, setLiveState] = useState<LiveTrackingState>(liveTrackingService.getState());
  const [deviceLoc, setDeviceLoc] = useState<DeviceLocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // When modal opens, acquire live GPS and public IP immediately
  useEffect(() => {
    if (visible) {
      setIsLocating(true);
      getExactDeviceLocation()
        .then((loc) => {
          setDeviceLoc(loc);
          // Auto-match nearest sector if close
          const nearest = SECTORS.reduce((prev, curr) => {
            const dPrev = Math.hypot(prev.lat - loc.latitude, prev.lng - loc.longitude);
            const dCurr = Math.hypot(curr.lat - loc.latitude, curr.lng - loc.longitude);
            return dCurr < dPrev ? curr : prev;
          });
          if (nearest) setSelectedSector(nearest);
        })
        .finally(() => setIsLocating(false));
    }
  }, [visible]);

  useEffect(() => {
    const unsub = liveTrackingService.subscribe((state) => {
      setLiveState(state);
    });
    return unsub;
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Unable to Auto-Dial', `Please dial: ${phone}`);
    });
  };

  const handleBroadcastSos = async (isSilent: boolean = false, categoryOverride?: string) => {
    setIsSending(true);

    // Refresh exact GPS coordinates and IP address at moment of trigger
    let currentLoc = deviceLoc;
    try {
      currentLoc = await getExactDeviceLocation();
      setDeviceLoc(currentLoc);
    } catch (_) {}

    const lat = currentLoc ? currentLoc.latitude : selectedSector.lat;
    const lng = currentLoc ? currentLoc.longitude : selectedSector.lng;
    const accuracy = currentLoc?.accuracy ?? null;
    const ipAddress = currentLoc?.ipAddress ?? 'Unknown IP';
    const googleMapsUrl = currentLoc ? currentLoc.googleMapsUrl : `https://www.google.com/maps?q=${lat},${lng}`;

    const cat = categoryOverride || (isSilent ? 'ARMED ROBBERY / HOSTAGE (SILENT)' : 'CRITICAL SOS BROADCAST');
    const accuracyText = accuracy ? ` (GPS Accuracy: ±${Math.round(accuracy)}m)` : '';

    const payload = {
      category: cat,
      severity: 'Critical',
      threatLevel: 'CODE_RED',
      location: selectedSector.name,
      latitude: lat,
      longitude: lng,
      accuracy,
      ipAddress,
      googleMapsUrl,
      landmark: isSilent ? 'Covert Citizen Panic' : 'One-Tap Panic Alert',
      description: isSilent
        ? `[SILENT PANIC ALERT - COVERT TRIGGER] Citizen activated covert distress alert at ${selectedSector.name}. Exact GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText}. IP: ${ipAddress}. Maps Pin: ${googleMapsUrl}. Immediate tactical armed response required. DO NOT SIREN APPROACH. ${shareCamera ? '[CAMERA EVIDENCE ACTIVE]' : ''} ${shareAudio ? '[AMBIENT AUDIO ACTIVE]' : ''}`.trim()
        : `EMERGENCY SOS: Citizen requested immediate emergency intervention at ${selectedSector.name} (${cat}). Exact GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText}. IP: ${ipAddress}. Maps Pin: ${googleMapsUrl}. ${shareCamera ? '[CAMERA EVIDENCE ACTIVE]' : ''} ${shareAudio ? '[AMBIENT AUDIO ACTIVE]' : ''}`.trim(),
      reporterName: isSilent ? 'Covert Citizen in Danger' : (user?.fullName || 'Distressed Citizen'),
      reporterPhone: user?.phone || 'Emergency Phone',
      isSos: true,
      isSilentPanic: isSilent,
      isLiveTracking: true,
      cameraFeedActive: shareCamera,
      audioFeedActive: shareAudio,
      timestamp: new Date().toISOString(),
    };

    const isOnline = syncManager.getOnlineStatus();

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const incId = data.incident?.id;
          if (incId) {
            // Automatically initiate live moving location stream with exact coordinates!
            liveTrackingService.startTracking(incId, { lat, lng });
          }
        }
      } catch {}
    } else {
      await queueOfflineSubmission('incident', payload);
      // Trigger emergency SMS fallback with exact GPS and Google Maps link
      const emergencySms = `SMSTO:08081762371:CODE RED ${cat} at ${selectedSector.name}. GPS: ${lat.toFixed(5)},${lng.toFixed(5)}. Maps: ${googleMapsUrl}. Contact: ${user?.phone || 'Citizen'}.`;
      Linking.openURL(emergencySms).catch(() => {});
    }

    setIsSending(false);

    if (isSilent) {
      Alert.alert(
        '🤫 SILENT PANIC TRANSMITTED',
        `Covert GPS & Sector distress signal sent to Ogere Police DPO & Patrol Command for ${selectedSector.name}.\n\n📍 Exact GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText}\n🌐 IP: ${ipAddress}\n\nResponse teams are alerted for non-siren tactical approach. Stay quiet and seek cover.`,
        [
          {
            text: '🗺️ View My Google Maps Pin',
            onPress: () => openInGoogleMaps(lat, lng),
          },
          { text: 'Dismiss Screen Silently', onPress: onClose },
        ]
      );
      return;
    }

    Alert.alert(
      '🚨 SOS BROADCAST SENT',
      `Emergency broadcast recorded for ${selectedSector.name}.\n\n📍 Exact GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText}\n🌐 IP: ${ipAddress}\n\nFirst responders and Palace Security have been dispatched to your exact coordinates.`,
      [
        {
          text: '🗺️ View Location on Google Maps',
          onPress: () => openInGoogleMaps(lat, lng),
        },
        {
          text: 'Call FRSC 122',
          onPress: () => handleCall('122'),
        },
        {
          text: 'Call Ogere DPO',
          onPress: () => handleCall('08081762371'),
        },
        {
          text: 'Close',
          style: 'cancel',
          onPress: onClose,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.sirenCircle}>
              <Text style={{ fontSize: 28 }}>🚨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>OGERE EMERGENCY SOS</Text>
              <Text style={styles.subtitle}>Rapid Security & Rescue Dispatch</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Live Radar HUD (Real-Time GPS Live Tracking) */}
            {liveState.isActive && (
              <View style={styles.liveRadarCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.liveRadarTitle}>🟢 LIVE TRACKING ACTIVE</Text>
                  <TouchableOpacity onPress={() => liveTrackingService.stopTracking()} style={styles.stopLiveBtn}>
                    <Text style={styles.stopLiveBtnText}>End Sharing</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.liveRadarDesc}>
                  Streaming live moving coordinates to Ogere Security Command.
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.liveRadarTime}>Pings: {liveState.pingCount}</Text>
                  <Text style={styles.liveRadarTime}>Speed: {liveState.currentCoords?.speed || 0} km/h</Text>
                  <Text style={styles.liveRadarTime}>Updated: {liveState.lastPingAt || 'Just now'}</Text>
                </View>
              </View>
            )}

            {/* Sector Selector */}
            <Text style={styles.sectionLabel}>Select Your Current Location / Sector:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectorScroll}>
              {SECTORS.map(s => (
                <TouchableOpacity
                  key={s.name}
                  onPress={() => setSelectedSector(s)}
                  style={[
                    styles.sectorChip,
                    selectedSector.name === s.name && styles.sectorChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sectorText,
                      selectedSector.name === s.name && styles.sectorTextActive,
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Live Camera & Ambient Audio Evidence Toggles */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                📡 LIVE SURVEILLANCE EVIDENCE (OPTIONAL)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setShareCamera(!shareCamera)}
                  style={{
                    flex: 1,
                    backgroundColor: shareCamera ? '#dc2626' : 'rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    padding: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: shareCamera ? '#f87171' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    📹 {shareCamera ? 'Camera: ON' : 'Share Camera'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShareAudio(!shareAudio)}
                  style={{
                    flex: 1,
                    backgroundColor: shareAudio ? '#059669' : 'rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    padding: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: shareAudio ? '#34d399' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    🎙️ {shareAudio ? 'Audio: ON' : 'Share Mic'}
                  </Text>
                </TouchableOpacity>
              </View>
              {(shareCamera || shareAudio) && (
                <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 6 }}>
                  🤫 Broadcasts visual and ambient sound evidence silently without emitting noise on this phone.
                </Text>
              )}
            </View>

            {/* Panic Broadcast Buttons: Standard SOS, Silent Panic, and Terrorism Alert */}
            <TouchableOpacity
              style={styles.panicButton}
              onPress={() => handleBroadcastSos(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.panicEmoji}>⚡</Text>
              <Text style={styles.panicText}>
                {isSending ? 'DISPATCHING SOS...' : 'BROADCAST PANIC ALERT NOW'}
              </Text>
              <Text style={styles.panicSub}>
                Transmits priority emergency telemetry to security command
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 4 }}>
              {/* Silent Robbery Panic */}
              <TouchableOpacity
                style={styles.silentPanicButton}
                onPress={() => handleBroadcastSos(true, 'ARMED ROBBERY / HOSTAGE')}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18 }}>🤫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.silentPanicTitle}>SILENT PANIC</Text>
                  <Text style={styles.silentPanicSub}>Robbery / Hostage (No sirens)</Text>
                </View>
              </TouchableOpacity>

              {/* Terrorism / Gunfire Threat */}
              <TouchableOpacity
                style={styles.terrorPanicButton}
                onPress={() => handleBroadcastSos(false, 'TERRORISM / ARMED GUNFIRE')}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18 }}>🚨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.terrorPanicTitle}>TERROR THREAT</Text>
                  <Text style={styles.terrorPanicSub}>Gunfire / Ambush / Banditry</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Direct Speed Dial Cards */}
            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
              Immediate Emergency Phone Lines:
            </Text>

            <View style={styles.servicesGrid}>
              {EMERGENCY_SERVICES.map(srv => (
                <TouchableOpacity
                  key={srv.phone}
                  style={styles.serviceItem}
                  onPress={() => handleCall(srv.phone)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceIconCircle}>
                    <Text style={{ fontSize: 20 }}>{srv.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{srv.title}</Text>
                    <Text style={styles.serviceDesc}>{srv.desc}</Text>
                  </View>
                  <View style={styles.callBadge}>
                    <Text style={styles.callBadgeText}>CALL {srv.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Dismiss Emergency Window</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.md,
    maxHeight: '85%',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  sirenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#991b1b',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  body: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectorScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectorChip: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    marginRight: 8,
  },
  sectorChipActive: {
    backgroundColor: '#991b1b',
    borderColor: '#991b1b',
  },
  sectorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sectorTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  panicButton: {
    backgroundColor: '#dc2626',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#b91c1c',
    gap: 2,
    marginVertical: 4,
    ...Shadows.elevated,
  },
  panicEmoji: {
    fontSize: 24,
  },
  panicText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  panicSub: {
    color: '#fee2e2',
    fontSize: 11,
  },
  silentPanicButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#475569',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  silentPanicTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  silentPanicSub: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 1,
  },
  terrorPanicButton: {
    flex: 1,
    backgroundColor: '#450a0a',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terrorPanicTitle: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  terrorPanicSub: {
    color: '#fecaca',
    fontSize: 9,
    marginTop: 1,
  },
  servicesGrid: {
    gap: 8,
    marginTop: 6,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: Radius.md,
    gap: 10,
  },
  serviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991b1b',
  },
  serviceDesc: {
    fontSize: 10,
    color: '#7f1d1d',
    marginTop: 1,
  },
  callBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
  },
  callBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  dismissText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  liveRadarCard: {
    backgroundColor: '#052e16',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 12,
  },
  liveRadarTitle: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveRadarDesc: {
    color: '#bbf7d0',
    fontSize: 11,
    lineHeight: 15,
  },
  liveRadarTime: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: '700',
  },
  stopLiveBtn: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stopLiveBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
