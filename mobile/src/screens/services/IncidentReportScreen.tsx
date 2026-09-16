import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { useAuth } from '../../services/authContext';
import { syncManager, API_BASE_URL } from '../../database/syncManager';
import { queueOfflineSubmission } from '../../database/sqlite';
import { liveTrackingService } from '../../services/liveTrackingService';
import {
  getExactDeviceLocation,
  openInGoogleMaps,
  DeviceLocationData,
} from '../../services/locationService';

const INCIDENT_CATEGORIES = [
  { id: 'armed_robbery', label: '🚨 Armed Robbery / Banditry', severity: 'Critical', threatLevel: 'CODE_RED' },
  { id: 'terrorism', label: '💥 Terrorism / Gunfire / Ambush', severity: 'Critical', threatLevel: 'CODE_RED' },
  { id: 'kidnapping', label: '🚷 Kidnapping / Abduction in Progress', severity: 'Critical', threatLevel: 'CODE_RED' },
  { id: 'highway_accident', label: '🚗 Highway Collision / Entrapment', severity: 'Critical', threatLevel: 'CODE_ORANGE' },
  { id: 'fire_tanker', label: '🔥 Fire Outbreak / Tanker Spill', severity: 'Critical', threatLevel: 'CODE_ORANGE' },
  { id: 'gas_leak', label: '⛽ CNG / Pipeline Gas Leakage', severity: 'Critical', threatLevel: 'CODE_ORANGE' },
  { id: 'flooding', label: '🌊 Road Flooding / Collapsed Culvert', severity: 'Medium', threatLevel: 'CODE_YELLOW' },
  { id: 'medical_crisis', label: '🏥 Medical Crisis / Cardiac / Trauma', severity: 'Critical', threatLevel: 'CODE_ORANGE' },
  { id: 'public_disorder', label: '⚠️ Public Disorder / Land Conflict', severity: 'Medium', threatLevel: 'CODE_YELLOW' },
];

const LANDMARKS = [
  { name: 'KM 66-68 Expressway Axis', lat: 6.9388, lng: 3.6437 },
  { name: 'Ogere Tollgate Corridor', lat: 6.9380, lng: 3.6410 },
  { name: 'Palace Way / Aafin Ologere', lat: 6.9368, lng: 3.6330 },
  { name: 'Isale-Ogere Hospital Road', lat: 6.9325, lng: 3.6310 },
  { name: 'OMCOOSA College Junction', lat: 6.9405, lng: 3.6397 },
  { name: 'Ogere Resort Axis', lat: 6.9388, lng: 3.6437 },
  { name: 'Oke-Ogere Market Complex', lat: 6.9354, lng: 3.6338 },
  { name: 'Trailer Park Outpost', lat: 6.9366, lng: 3.6344 },
  { name: 'Agbele Ancestral Farmland', lat: 6.9290, lng: 3.6260 },
];

const SEVERITIES = [
  { id: 'Critical', label: '🔴 Critical (Life Threatening)', desc: 'Immediate dispatch of emergency rescue' },
  { id: 'High', label: '🟠 High Hazard', desc: 'Active danger or major property threat' },
  { id: 'Medium', label: '🟡 Moderate Issue', desc: 'Traffic impediment or structural damage' },
  { id: 'Low', label: '🟢 Low Hazard', desc: 'General civic notice or minor defect' },
];

export const IncidentReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(INCIDENT_CATEGORIES[0].label);
  const [severity, setSeverity] = useState('Critical');
  const [landmark, setLandmark] = useState(LANDMARKS[0]);
  const [specificLocation, setSpecificLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterPhone, setReporterPhone] = useState(user?.phone || '');
  const [enableLiveTracking, setEnableLiveTracking] = useState(true);
  const [cameraFeedActive, setCameraFeedActive] = useState(false);
  const [audioFeedActive, setAudioFeedActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Precision Telemetry State: Real GPS & Device Public IP
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocationData | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [useLiveGps, setUseLiveGps] = useState(true);

  const acquireLocation = async () => {
    setFetchingLocation(true);
    try {
      const loc = await getExactDeviceLocation();
      setDeviceLocation(loc);
    } catch (err) {
      console.warn('[IncidentReportScreen] Location acquisition warning:', err);
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Unable to Dial', `Please call: ${phone}`);
    });
  };

  const handleCategorySelect = (item: typeof INCIDENT_CATEGORIES[0]) => {
    setSelectedCategory(item.label);
    if (item.severity === 'Critical') {
      setSeverity('Critical');
    }
  };

  const handleSubmit = async () => {
    const fullLoc = specificLocation.trim()
      ? `${landmark.name} — ${specificLocation.trim()}`
      : landmark.name;

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide a brief description of the emergency or hazard.');
      return;
    }

    setLoading(true);
    const selectedItem = INCIDENT_CATEGORIES.find(c => c.label === selectedCategory);
    const threatLevel = selectedItem?.threatLevel || (severity === 'Critical' ? 'CODE_RED' : 'CODE_YELLOW');

    const effectiveLat = (useLiveGps && deviceLocation) ? deviceLocation.latitude : landmark.lat;
    const effectiveLng = (useLiveGps && deviceLocation) ? deviceLocation.longitude : landmark.lng;
    const accuracy = (useLiveGps && deviceLocation) ? deviceLocation.accuracy : null;
    const ipAddress = deviceLocation?.ipAddress || null;
    const googleMapsUrl = deviceLocation?.googleMapsUrl || `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`;

    const payload = {
      category: selectedCategory,
      severity,
      threatLevel,
      location: fullLoc,
      landmark: landmark.name,
      latitude: effectiveLat,
      longitude: effectiveLng,
      accuracy,
      ipAddress,
      googleMapsUrl,
      description: description.trim(),
      reporterName: isAnonymous ? 'Anonymous Citizen' : (user?.fullName || 'Concerned Citizen'),
      reporterPhone: isAnonymous ? null : reporterPhone.trim(),
      isAnonymous,
      isSos: severity === 'Critical',
      isLiveTracking: enableLiveTracking,
      cameraFeedActive,
      audioFeedActive,
      timestamp: new Date().toISOString(),
    };

    const isOnline = syncManager.getOnlineStatus();

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          const incId = data?.incident?.id;
          if (enableLiveTracking && incId) {
            liveTrackingService.startTracking(incId, { lat: effectiveLat, lng: effectiveLng });
          }
          setLoading(false);
          postSubmitPrompt(true);
          return;
        }
      } catch {}
    }

    // Save offline in persistent queue
    await queueOfflineSubmission('incident', payload);
    setLoading(false);
    postSubmitPrompt(false);
  };

  const postSubmitPrompt = (online: boolean) => {
    const title = severity === 'Critical' ? '🚨 EMERGENCY DISPATCH LOGGED' : 'Incident Report Recorded';
    const message = online
      ? 'Your report has been transmitted directly to the Palace Security Secretariat, Ogere DPO Police Command, and FRSC Expressway Outpost.'
      : 'You are currently offline. Your report has been saved securely on this device and will transmit automatically once internet is restored.';

    Alert.alert(
      title,
      message,
      severity === 'Critical'
        ? [
            { text: 'Call Ogere DPO', onPress: () => handleCall('08081762371') },
            { text: 'Call FRSC 122', onPress: () => handleCall('122') },
            { text: 'Return to Hub', style: 'cancel', onPress: () => navigation.goBack() },
          ]
        : [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="INCIDENT DISPATCH" subtitle="Palace & Civic Emergency Desk" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTab')} 
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Return to Home / Services</Text>
        </TouchableOpacity>

        {/* Immediate Emergency Action Banner */}
        <View style={styles.emergencyQuickBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyQuickTitle}>🚨 Active Life-Threatening Crisis?</Text>
            <Text style={styles.emergencyQuickSubtitle}>Direct speed-dial connects to responders immediately:</Text>
          </View>
          <View style={styles.emergencyQuickBtns}>
            <TouchableOpacity onPress={() => handleCall('122')} style={styles.speedDialRed}>
              <Text style={styles.speedDialText}>FRSC 122</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall('08034567890')} style={styles.speedDialBlue}>
              <Text style={styles.speedDialText}>POLICE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.formCard}>
          {/* 1. Incident Category */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>1. Select Incident Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {INCIDENT_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategorySelect(cat)}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                  >
                    <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. Severity Level */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>2. Severity Assessment *</Text>
            <View style={styles.severityList}>
              {SEVERITIES.map(s => {
                const isSelected = severity === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSeverity(s.id)}
                    style={[
                      styles.severityOption,
                      isSelected && (s.id === 'Critical' ? styles.severityCriticalActive : styles.severityActive),
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.severityLabel,
                          isSelected && (s.id === 'Critical' ? { color: '#dc2626' } : { color: Colors.primary }),
                        ]}
                      >
                        {s.label}
                      </Text>
                      <Text style={styles.severityDesc}>{s.desc}</Text>
                    </View>
                    {isSelected && (
                      <Text style={{ fontSize: 16, color: s.id === 'Critical' ? '#dc2626' : Colors.primary }}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Location & Landmark Selection */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>3. Incident Location & Landmark *</Text>
            
            {/* Live GPS Telemetry Box */}
            <View style={styles.gpsTelemetryBox}>
              <View style={styles.gpsTelemetryHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>🛰️</Text>
                  <Text style={styles.gpsTelemetryTitle}>Exact Reporter GPS & IP Telemetry</Text>
                </View>
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color="#22c55e" />
                ) : (
                  <TouchableOpacity onPress={acquireLocation} style={styles.refreshGpsBtn}>
                    <Text style={styles.refreshGpsBtnText}>🔄 Refresh GPS</Text>
                  </TouchableOpacity>
                )}
              </View>

              {deviceLocation ? (
                <View style={styles.gpsDetailsGrid}>
                  <View style={styles.gpsStatItem}>
                    <Text style={styles.gpsStatLabel}>EXACT COORDINATES</Text>
                    <Text style={styles.gpsStatValue}>
                      {deviceLocation.latitude.toFixed(5)}°N, {deviceLocation.longitude.toFixed(5)}°E
                    </Text>
                  </View>
                  <View style={styles.gpsStatItem}>
                    <Text style={styles.gpsStatLabel}>ACCURACY</Text>
                    <Text style={[styles.gpsStatValue, { color: deviceLocation.isGpsPrecise ? '#4ade80' : '#fde047' }]}>
                      {deviceLocation.accuracy ? `±${Math.round(deviceLocation.accuracy)}m (${deviceLocation.isGpsPrecise ? 'Precise GPS' : 'Cell/IP'})` : 'Estimated'}
                    </Text>
                  </View>
                  <View style={styles.gpsStatItem}>
                    <Text style={styles.gpsStatLabel}>DEVICE PUBLIC IP</Text>
                    <Text style={styles.gpsStatValue}>
                      {deviceLocation.ipAddress}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.gpsDetectingText}>
                  {fetchingLocation ? 'Acquiring satellite lock and network IP...' : 'Tap Refresh GPS to acquire exact satellite coordinates'}
                </Text>
              )}

              <View style={styles.gpsActionsRow}>
                <TouchableOpacity
                  onPress={() => setUseLiveGps(!useLiveGps)}
                  style={[styles.useGpsToggleBtn, useLiveGps && styles.useGpsToggleActive]}
                >
                  <Text style={[styles.useGpsToggleText, useLiveGps && styles.useGpsToggleTextActive]}>
                    {useLiveGps ? '✓ Using Exact Device GPS' : 'Using Reference Landmark'}
                  </Text>
                </TouchableOpacity>

                {deviceLocation && (
                  <TouchableOpacity
                    onPress={() => openInGoogleMaps(deviceLocation.latitude, deviceLocation.longitude, 'Reported Incident Location')}
                    style={styles.openMapsBtn}
                  >
                    <Text style={styles.openMapsBtnText}>🗺️ Preview on Google Maps</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={[styles.sectionSublabel, { marginTop: 8 }]}>Select Nearest Ogere Sector / Landmark:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {LANDMARKS.map(lm => {
                const isSelected = landmark.name === lm.name;
                return (
                  <TouchableOpacity
                    key={lm.name}
                    onPress={() => setLandmark(lm)}
                    style={[styles.landmarkChip, isSelected && styles.landmarkChipActive]}
                  >
                    <Text style={[styles.landmarkText, isSelected && styles.landmarkTextActive]}>
                      📍 {lm.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Specific street details, kilometer post, or landmark details"
              placeholderTextColor={Colors.textMuted}
              value={specificLocation}
              onChangeText={setSpecificLocation}
            />
          </View>

          {/* 4. Description */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>4. Detailed Description of Hazard / Emergency *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detail what is happening, number of casualties or vehicles involved, active flames, or security weapons observed..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 5. Reporter Identity & Anonymity */}
          <View style={styles.reporterCard}>
            <View style={styles.anonToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.anonTitle}>Report Anonymously</Text>
                <Text style={styles.anonSubtitle}>
                  Hide your name and phone number from public logs
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAnonymous(!isAnonymous)}
                style={[styles.toggleBtn, isAnonymous && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, isAnonymous && styles.toggleBtnTextActive]}>
                  {isAnonymous ? 'ANONYMOUS' : 'VERIFIED'}
                </Text>
              </TouchableOpacity>
            </View>

            {!isAnonymous && (
              <View style={{ marginTop: 10, gap: 6 }}>
                <Text style={styles.reporterInfoLabel}>
                  Reporting as: <Text style={{ fontWeight: '800' }}>{user?.fullName || 'Concerned Citizen'}</Text>
                </Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Callback phone number (e.g. 08034512345)"
                  placeholderTextColor={Colors.textMuted}
                  value={reporterPhone}
                  onChangeText={setReporterPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>

          {/* 6. Real-Time Live Moving Location Toggle */}
          <View style={styles.liveToggleCard}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14 }}>📡</Text>
                <Text style={styles.liveToggleTitle}>Live Location Radar (Real-Time GPS)</Text>
              </View>
              <Text style={styles.liveToggleSub}>
                Perpetually stream your moving coordinates to Ogere Security Command while moving
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setEnableLiveTracking(!enableLiveTracking)}
              style={[styles.toggleBtn, enableLiveTracking && styles.liveToggleBtnActive]}
            >
              <Text style={[styles.toggleBtnText, enableLiveTracking && styles.liveToggleBtnTextActive]}>
                {enableLiveTracking ? '🟢 ACTIVE' : 'DISABLED'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 7. Live Camera & Ambient Audio Evidence Toggles */}
          <View style={[styles.liveToggleCard, { flexDirection: 'column', gap: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14 }}>🛡️</Text>
              <Text style={styles.liveToggleTitle}>Live Surveillance Evidence (Camera & Audio)</Text>
            </View>
            <Text style={styles.liveToggleSub}>
              Attach covert camera snapshots and ambient audio feeds to aid police and rescue units.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setCameraFeedActive(!cameraFeedActive)}
                style={[styles.toggleBtn, { flex: 1, height: 38 }, cameraFeedActive && styles.liveToggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, cameraFeedActive && styles.liveToggleBtnTextActive]}>
                  📹 {cameraFeedActive ? 'Camera: ON' : 'Share Camera'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAudioFeedActive(!audioFeedActive)}
                style={[styles.toggleBtn, { flex: 1, height: 38 }, audioFeedActive && styles.liveToggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, audioFeedActive && styles.liveToggleBtnTextActive]}>
                  🎙️ {audioFeedActive ? 'Ambient Mic: ON' : 'Share Mic'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title={severity === 'Critical' ? '🚨 TRANSMIT EMERGENCY SOS DISPATCH' : 'Submit Civic Hazard Report'}
            variant={severity === 'Critical' ? 'secondary' : 'primary'}
            size="lg"
            loading={loading}
            onPress={handleSubmit}
            style={{ marginTop: 8 }}
          />

          <Text style={styles.offlineNotice}>
            ⚡ 100% Offline Queued: If internet or mobile data is down, your report is saved securely and dispatches automatically.
          </Text>
        </Card>
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
    gap: 14,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  emergencyQuickBar: {
    backgroundColor: '#b91c1c',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    ...Shadows.elevated,
  },
  emergencyQuickTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  emergencyQuickSubtitle: {
    color: '#fecaca',
    fontSize: 11,
    marginTop: 2,
  },
  emergencyQuickBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  speedDialRed: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
    flex: 1,
  },
  speedDialBlue: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
    flex: 1,
  },
  speedDialText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  formCard: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#991b1b',
    borderColor: '#991b1b',
  },
  catText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  severityList: {
    gap: 6,
  },
  severityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceSubtle,
  },
  severityActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  severityCriticalActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  severityLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  severityDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  landmarkChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  landmarkChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  landmarkText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  landmarkTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceSubtle,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  reporterCard: {
    backgroundColor: Colors.surfaceSubtle,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  anonToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  anonSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  toggleBtn: {
    backgroundColor: Colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: '#0f172a',
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  reporterInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  phoneInput: {
    height: 42,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#ffffff',
    color: Colors.textPrimary,
  },
  offlineNotice: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  liveToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#052e16',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  liveToggleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4ade80',
  },
  liveToggleSub: {
    fontSize: 10,
    color: '#bbf7d0',
    marginTop: 2,
    lineHeight: 14,
  },
  liveToggleBtnActive: {
    backgroundColor: '#22c55e',
  },
  liveToggleBtnTextActive: {
    color: '#052e16',
  },
  sectionSublabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  gpsTelemetryBox: {
    backgroundColor: '#0f172a',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    padding: 12,
    gap: 8,
    marginVertical: 4,
  },
  gpsTelemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsTelemetryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
  },
  refreshGpsBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  refreshGpsBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
  },
  gpsDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  gpsStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    flex: 1,
    minWidth: 90,
  },
  gpsStatLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gpsStatValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  gpsDetectingText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  gpsActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  useGpsToggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#64748b',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  useGpsToggleActive: {
    backgroundColor: '#0369a1',
    borderColor: '#38bdf8',
  },
  useGpsToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  useGpsToggleTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  openMapsBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  openMapsBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ade80',
  },
});
