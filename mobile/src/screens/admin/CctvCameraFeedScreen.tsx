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
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';
import { getOgereMapUrls } from '../../services/ogereGeoEngine';

const { width } = Dimensions.get('window');

const FALLBACK_CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Ogere Tollgate North ANPR (Lagos-Ibadan Exp.)',
    sector: 'Sector 1 — Highway Corridor',
    location: 'KM 66.8 Lagos-Ibadan Expressway Intercept',
    latitude: 6.9388,
    longitude: 3.6437,
    agency: 'Federal Road Safety Corps (FRSC)',
    resolution: '4K UHD · 60 FPS',
    fps: 60,
    latencyMs: 32,
    status: 'LIVE_HD',
    ptzCapable: true,
    anprEnabled: true,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=60',
    activePlates: ['LSR-821-XA (Toyota Hilux) - Cleared', 'KJA-319-BB (Innoson Bus) - Speed 82km/h'],
  },
  {
    id: 'CAM-02',
    name: 'Aafin Ologere Palace Square (PTZ 360° Dome)',
    sector: 'Sector 2 — Central Heritage Core',
    location: 'Palace Way / Oba Council Chamber',
    latitude: 6.9372,
    longitude: 3.6335,
    agency: 'Palace Royal Guard / Vigilante',
    resolution: '1080p · 30 FPS',
    fps: 30,
    latencyMs: 24,
    status: 'LIVE_HD',
    ptzCapable: true,
    anprEnabled: false,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=60',
    activePlates: [],
  },
  {
    id: 'CAM-03',
    name: 'Ogere Trailer Park Weighbridge & Haulage Hub',
    sector: 'Sector 1 — Highway Corridor',
    location: 'Trailer Park Bypass South Gate',
    latitude: 6.9366,
    longitude: 3.6344,
    agency: 'So-Safe Corps / Fire Precaution',
    resolution: '1080p · 30 FPS',
    fps: 30,
    latencyMs: 48,
    status: 'MOTION_DETECTED',
    ptzCapable: true,
    anprEnabled: true,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60',
    activePlates: ['KTU-912-XY (Mack Hauler) - Motion Flag'],
  },
  {
    id: 'CAM-04',
    name: 'Oja Ogere Central Market & Commercial Ring',
    sector: 'Sector 2 — Central Heritage Core',
    location: 'Market Road / Civic Center',
    latitude: 6.9354,
    longitude: 3.6338,
    agency: 'Joint Vigilante Command',
    resolution: '1080p · 30 FPS',
    fps: 30,
    latencyMs: 38,
    status: 'LIVE_HD',
    ptzCapable: true,
    anprEnabled: false,
    nightVision: false,
    thumbnail: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=60',
    activePlates: [],
  },
  {
    id: 'CAM-05',
    name: 'Isale-Ogere Hospital Junction & Emergency Axis',
    sector: 'Sector 4 — Medical & Social',
    location: 'Isale-Ogere Hospital Road',
    latitude: 6.9325,
    longitude: 3.6310,
    agency: 'Civil Defence (NSCDC)',
    resolution: '1080p · 30 FPS',
    fps: 30,
    latencyMs: 29,
    status: 'LIVE_HD',
    ptzCapable: false,
    anprEnabled: false,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=60',
    activePlates: [],
  },
  {
    id: 'CAM-06',
    name: 'Ositelu Memorial / Awomosu Academic Axis',
    sector: 'Sector 5 — Academic Belt',
    location: 'Awomosu Agbato Drive',
    latitude: 6.9405,
    longitude: 3.6397,
    agency: 'Community Watch',
    resolution: '1080p · 30 FPS',
    fps: 30,
    latencyMs: 44,
    status: 'LIVE_HD',
    ptzCapable: true,
    anprEnabled: false,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
    activePlates: [],
  },
  {
    id: 'CAM-07',
    name: 'Saapade Junction / Remo North Axis Gateway',
    sector: 'Sector 7 — Northern Gateway',
    location: 'Ibadan-Remo Arterial Junction',
    latitude: 6.9550,
    longitude: 3.6480,
    agency: 'Joint Border Command',
    resolution: '4K UHD · 60 FPS',
    fps: 60,
    latencyMs: 31,
    status: 'LIVE_HD',
    ptzCapable: true,
    anprEnabled: true,
    nightVision: true,
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=60',
    activePlates: ['ABJ-502-KW (Toyota Prado) - Verified Diplomatic'],
  },
];

export const CctvCameraFeedScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const [cameras, setCameras] = useState<any[]>(FALLBACK_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(
    route?.params?.cameraId || 'CAM-01'
  );
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [nightVision, setNightVision] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [ptzMessage, setPtzMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recTimer, setRecTimer] = useState<string>('');
  const [snapshotCount, setSnapshotCount] = useState(0);

  // Fetch cameras from backend
  const fetchCameras = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cctv`);
      if (res.ok) {
        const data = await res.json();
        if (data.cameras && data.cameras.length > 0) {
          setCameras(data.cameras);
        }
      }
    } catch (err) {
      console.warn('[CctvFeed] API fetch fallback to local registry:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    const interval = setInterval(fetchCameras, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update OSD clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setRecTimer(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} WAT`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCam =
    cameras.find((c) => c.id === selectedCameraId) || cameras[0] || FALLBACK_CAMERAS[0];

  const handlePtzAction = async (action: string) => {
    setPtzMessage(`PTZ: ${action.toUpperCase()}...`);
    try {
      await fetch(`${API_BASE_URL}/api/cctv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: activeCam.id,
          action,
          zoom: zoomLevel,
        }),
      });
      setTimeout(() => setPtzMessage(`PTZ Lock: Position OK`), 1200);
    } catch {
      setTimeout(() => setPtzMessage(''), 1500);
    }
  };

  const handleSnapshot = () => {
    setSnapshotCount((prev) => prev + 1);
    Alert.alert(
      '📸 Snapshot Secured',
      `High-res frame archived to Police Evidence Vault:\nFile: OGR-CCTV-${activeCam.id}-${Date.now()}.png\nSector: ${activeCam.sector}`
    );
  };

  const handleDispatchPatrol = () => {
    Alert.alert(
      '🚨 Dispatch Patrol to Sector',
      `Rendezvous unit to ${activeCam.location} (${activeCam.sector})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch Units',
          style: 'destructive',
          onPress: () => {
            const urls = getOgereMapUrls(activeCam.latitude, activeCam.longitude, activeCam.location);
            Linking.openURL(urls.turnByTurnNavigation);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>MUNICIPAL CCTV SURVEILLANCE</Text>
          <Text style={styles.headerSub}>Ogere Remote Command & ANPR Grid</Text>
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('single')}
            style={[styles.toggleBtn, viewMode === 'single' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'single' && styles.toggleTextActive]}>
              Single
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>
              Grid (7)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchCameras();
            }}
            tintColor={Colors.gold}
          />
        }
      >
        {/* Camera Selector Strip */}
        <View style={styles.selectorStrip}>
          <Text style={styles.sectionHeader}>CAMERA INSTALLATIONS ({cameras.length} ONLINE)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {cameras.map((c) => {
              const isSelected = c.id === activeCam.id;
              const hasMotion = c.status === 'MOTION_DETECTED';
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    setSelectedCameraId(c.id);
                    setViewMode('single');
                  }}
                  style={[
                    styles.camChip,
                    isSelected && styles.camChipSelected,
                    hasMotion && styles.camChipMotion,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: hasMotion ? '#f59e0b' : '#22c55e' },
                      ]}
                    />
                    <Text style={[styles.camChipId, isSelected && { color: '#ffffff' }]}>
                      {c.id}
                    </Text>
                  </View>
                  <Text style={styles.camChipName} numberOfLines={1}>
                    {c.name.split('(')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {viewMode === 'single' ? (
          <>
            {/* Main Single Feed Player View */}
            <View style={styles.playerCard}>
              {/* OSD Header Bar */}
              <View style={styles.playerOsdTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.recDot} />
                  <Text style={styles.recText}>REC</Text>
                  <Text style={styles.recTimer}>{recTimer || 'LIVE WAT'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.osdFps}>{activeCam.resolution || '1080p 30FPS'}</Text>
                  <Text style={styles.osdLatency}>{activeCam.latencyMs || 28}ms</Text>
                </View>
              </View>

              {/* Video Surface Simulation */}
              <View
                style={[
                  styles.videoSurface,
                  nightVision && styles.videoNightVision,
                ]}
              >
                <Image
                  source={{ uri: activeCam.thumbnail }}
                  style={[
                    StyleSheet.absoluteFillObject,
                    nightVision && { opacity: 0.65, tintColor: '#86efac' },
                    { transform: [{ scale: zoomLevel }] },
                  ]}
                  resizeMode="cover"
                />

                {/* Reticle / Crosshair Overlay */}
                <View style={styles.crosshairCenter} />
                <View style={styles.crosshairBox} />

                {/* Night Vision Indicator Pill */}
                {nightVision && (
                  <View style={styles.nvIndicator}>
                    <Text style={styles.nvText}>👁️ IR NIGHT VISION ACTIVE</Text>
                  </View>
                )}

                {/* PTZ Status Toast */}
                {ptzMessage ? (
                  <View style={styles.ptzToast}>
                    <Text style={styles.ptzToastText}>{ptzMessage}</Text>
                  </View>
                ) : null}

                {/* Lower OSD Overlay */}
                <View style={styles.playerOsdBottom}>
                  <Text style={styles.camTitleOsd}>{activeCam.name}</Text>
                  <Text style={styles.camLocationOsd}>
                    📍 {activeCam.location} · {activeCam.agency}
                  </Text>
                </View>
              </View>

              {/* Video Quick Controls */}
              <View style={styles.controlsBar}>
                {/* Night vision switch */}
                <TouchableOpacity
                  onPress={() => setNightVision(!nightVision)}
                  style={[styles.controlBtn, nightVision && styles.controlBtnActive]}
                >
                  <Text style={styles.controlBtnText}>
                    {nightVision ? '👁️ Day View' : '🌙 Night Vision'}
                  </Text>
                </TouchableOpacity>

                {/* Snapshot Button */}
                <TouchableOpacity onPress={handleSnapshot} style={styles.controlBtn}>
                  <Text style={styles.controlBtnText}>📸 Snapshot ({snapshotCount})</Text>
                </TouchableOpacity>

                {/* Google Maps Pin */}
                <TouchableOpacity
                  onPress={() => {
                    const urls = getOgereMapUrls(activeCam.latitude, activeCam.longitude, activeCam.name);
                    Linking.openURL(urls.satellitePin);
                  }}
                  style={styles.controlBtn}
                >
                  <Text style={styles.controlBtnText}>🛰️ Sat Pin</Text>
                </TouchableOpacity>

                {/* Intercept Dispatch */}
                <TouchableOpacity onPress={handleDispatchPatrol} style={styles.dispatchBtn}>
                  <Text style={styles.dispatchBtnText}>🚨 Dispatch Unit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* PTZ Directional Controller Pad */}
            {activeCam.ptzCapable && (
              <View style={styles.ptzCard}>
                <View style={styles.ptzHeader}>
                  <Text style={styles.ptzTitle}>🕹️ 360° PTZ DOME CONTROLLER</Text>
                  <Text style={styles.ptzSub}>Pan, Tilt & Optical Zoom Calibration</Text>
                </View>

                <View style={styles.ptzBody}>
                  {/* Directional Pad */}
                  <View style={styles.dpadContainer}>
                    <TouchableOpacity
                      onPress={() => handlePtzAction('tilt_up')}
                      style={[styles.dpadBtn, styles.dpadUp]}
                    >
                      <Text style={styles.dpadArrow}>▲</Text>
                    </TouchableOpacity>

                    <View style={styles.dpadMiddleRow}>
                      <TouchableOpacity
                        onPress={() => handlePtzAction('pan_left')}
                        style={[styles.dpadBtn, styles.dpadLeft]}
                      >
                        <Text style={styles.dpadArrow}>◄</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setZoomLevel(1);
                          handlePtzAction('reset_center');
                        }}
                        style={styles.dpadCenter}
                      >
                        <Text style={styles.dpadCenterText}>↺</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handlePtzAction('pan_right')}
                        style={[styles.dpadBtn, styles.dpadRight]}
                      >
                        <Text style={styles.dpadArrow}>►</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handlePtzAction('tilt_down')}
                      style={[styles.dpadBtn, styles.dpadDown]}
                    >
                      <Text style={styles.dpadArrow}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Zoom Controller */}
                  <View style={styles.zoomContainer}>
                    <Text style={styles.zoomLabel}>OPTICAL ZOOM</Text>
                    <Text style={styles.zoomLevelText}>{zoomLevel.toFixed(1)}x</Text>
                    <View style={styles.zoomButtons}>
                      <TouchableOpacity
                        onPress={() => {
                          const next = Math.min(3, zoomLevel + 0.5);
                          setZoomLevel(next);
                          handlePtzAction(`zoom_in_${next}x`);
                        }}
                        style={styles.zoomBtn}
                      >
                        <Text style={styles.zoomBtnText}>🔍 +</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          const next = Math.max(1, zoomLevel - 0.5);
                          setZoomLevel(next);
                          handlePtzAction(`zoom_out_${next}x`);
                        }}
                        style={styles.zoomBtn}
                      >
                        <Text style={styles.zoomBtnText}>🔍 -</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ANPR Automatic License Plate Feed */}
            {activeCam.anprEnabled && (
              <View style={styles.anprCard}>
                <View style={styles.anprHeader}>
                  <Text style={styles.anprTitle}>🚘 ANPR HIGHWAY OPTICAL SCANNER</Text>
                  <Text style={styles.anprSub}>Real-Time Tollgate License Detection</Text>
                </View>
                {activeCam.activePlates && activeCam.activePlates.length > 0 ? (
                  <View style={styles.plateList}>
                    {activeCam.activePlates.map((plate: string, idx: number) => (
                      <View key={idx} style={styles.plateRow}>
                        <Text style={{ fontSize: 16 }}>🏷️</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.plateText}>{plate.split(' - ')[0]}</Text>
                          <Text style={styles.plateSub}>{plate.split(' - ')[1] || 'Verified'}</Text>
                        </View>
                        <View style={styles.clearedBadge}>
                          <Text style={styles.clearedText}>LOGGED</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyPlateText}>
                    Scanning passing vehicles along expressway lane...
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          /* Multi-Camera 2x2 Grid View */
          <View style={styles.gridContainer}>
            {cameras.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  setSelectedCameraId(c.id);
                  setViewMode('single');
                }}
                style={styles.gridItem}
              >
                <Image
                  source={{ uri: c.thumbnail }}
                  style={styles.gridThumb}
                  resizeMode="cover"
                />
                <View style={styles.gridOsd}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={styles.statusDot} />
                    <Text style={styles.gridCamId}>{c.id}</Text>
                  </View>
                  <Text style={styles.gridCamName} numberOfLines={1}>
                    {c.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  topBar: {
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
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 10,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: Radius.sm,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  selectorStrip: {
    gap: 6,
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  selectorScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  camChip: {
    backgroundColor: '#1e293b',
    borderRadius: Radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 120,
  },
  camChipSelected: {
    borderColor: Colors.gold,
    backgroundColor: '#273549',
  },
  camChipMotion: {
    borderColor: '#f59e0b',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  camChipId: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '900',
  },
  camChipName: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 2,
  },
  playerCard: {
    backgroundColor: '#000000',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  playerOsdTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
  },
  recTimer: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  osdFps: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  osdLatency: {
    color: '#4ade80',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  videoSurface: {
    height: 230,
    position: 'relative',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  videoNightVision: {
    backgroundColor: '#052e16',
  },
  crosshairCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
  },
  crosshairBox: {
    position: 'absolute',
    left: '35%',
    top: '30%',
    width: '30%',
    height: '40%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  nvIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(5,46,22,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  nvText: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '900',
  },
  ptzToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  ptzToastText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '800',
  },
  playerOsdBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  camTitleOsd: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  camLocationOsd: {
    color: '#cbd5e1',
    fontSize: 9,
    marginTop: 1,
  },
  controlsBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 8,
    gap: 6,
    alignItems: 'center',
  },
  controlBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnActive: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
  },
  controlBtnText: {
    color: '#e2e8f0',
    fontSize: 9,
    fontWeight: '700',
  },
  dispatchBtn: {
    marginLeft: 'auto',
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dispatchBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  ptzCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    gap: 10,
  },
  ptzHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 6,
  },
  ptzTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  ptzSub: {
    color: '#94a3b8',
    fontSize: 9,
  },
  ptzBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dpadContainer: {
    alignItems: 'center',
    width: 120,
  },
  dpadBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#1f2937',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dpadUp: {
    marginBottom: 4,
  },
  dpadDown: {
    marginTop: 4,
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dpadLeft: {},
  dpadRight: {},
  dpadCenter: {
    width: 36,
    height: 36,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  dpadCenterText: {
    color: Colors.goldLight,
    fontSize: 16,
    fontWeight: '800',
  },
  dpadArrow: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  zoomContainer: {
    alignItems: 'center',
    gap: 4,
  },
  zoomLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
  },
  zoomLevelText: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  zoomButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  zoomBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  zoomBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
  },
  anprCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    gap: 8,
  },
  anprHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 6,
  },
  anprTitle: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
  },
  anprSub: {
    color: '#94a3b8',
    fontSize: 9,
  },
  plateList: {
    gap: 6,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2333',
    padding: 8,
    borderRadius: Radius.sm,
    gap: 8,
  },
  plateText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  plateSub: {
    color: '#94a3b8',
    fontSize: 9,
  },
  clearedBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearedText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '800',
  },
  emptyPlateText: {
    color: '#64748b',
    fontSize: 10,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: (width - Spacing.md * 2 - 8) / 2,
    height: 120,
    backgroundColor: '#000000',
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridThumb: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  gridOsd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 6,
  },
  gridCamId: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  gridCamName: {
    color: '#cbd5e1',
    fontSize: 8,
  },
});
