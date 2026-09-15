import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';

interface IncidentStatus {
  id: string;
  category: string;
  landmark: string;
  status: 'dispatched' | 'intercepting' | 'contained' | 'resolved';
  timestamp: string;
  coordinates: string;
  assignedAgency: string;
  patrolOfficer: string;
  isLiveTracking: boolean;
  notes: string[];
}

const DEMO_INCIDENTS: Record<string, IncidentStatus> = {
  'OGR-SOS-8419': {
    id: 'OGR-SOS-8419',
    category: 'Armed Highway Intercept / Highway Disturbance',
    landmark: 'KM 66-68 Expressway Axis (Near Ogere Tollgate)',
    status: 'intercepting',
    timestamp: '12 mins ago · 09:34 AM',
    coordinates: '6.9740° N, 3.6398° E',
    assignedAgency: 'Nigeria Police Force & Ogere Vigilante Joint Rapid Patrol',
    patrolOfficer: 'Insp. Kayode Adeleke (Unit Bravo-04)',
    isLiveTracking: true,
    notes: [
      '09:34 AM: SOS distress packet broadcast received from mobile telemetry.',
      '09:36 AM: Tactical patrol dispatched with Code-Red siren override.',
      '09:41 AM: Patrol Unit Bravo-04 reports visual contact; suspect vehicle intercepted.',
      '09:44 AM: Situation under armed containment; medical support standing by.',
    ],
  },
  'OGR-INC-102': {
    id: 'OGR-INC-102',
    category: 'Oil Pipeline Vandalism / High Hazard Alert',
    landmark: 'Wasimi / Pipeline Right-of-Way Corridor',
    status: 'contained',
    timestamp: '2 hours ago · 07:15 AM',
    coordinates: '6.9890° N, 3.6610° E',
    assignedAgency: 'Civil Defence (NSCDC) & Palace Vigilante Corps',
    patrolOfficer: 'Officer Babatunde (NSCDC-OG-10)',
    isLiveTracking: false,
    notes: [
      '07:15 AM: Citizen whistleblower tip logged anonymously.',
      '07:30 AM: Joint security cordon established around valve manifold.',
      '08:10 AM: NNPC engineering team notified; valves safely depressurized.',
    ],
  },
};

export const TrackIncidentScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const initialId = route.params?.incidentId || 'OGR-SOS-8419';
  const [searchId, setSearchId] = useState(initialId);
  const [incident, setIncident] = useState<IncidentStatus | null>(
    DEMO_INCIDENTS[initialId] || DEMO_INCIDENTS['OGR-SOS-8419']
  );
  const [searched, setSearched] = useState(true);

  const handleTrack = () => {
    const cleanId = searchId.trim().toUpperCase();
    if (!cleanId) {
      Alert.alert('Empty ID', 'Please enter a valid Incident Tracking Reference ID.');
      return;
    }

    if (DEMO_INCIDENTS[cleanId]) {
      setIncident(DEMO_INCIDENTS[cleanId]);
    } else {
      // Dynamic generated mock if not in demo map
      setIncident({
        id: cleanId,
        category: 'Emergency SOS Broadcast',
        landmark: 'Central Ogere Remo Sector',
        status: 'dispatched',
        timestamp: 'Just now',
        coordinates: '6.9812° N, 3.6521° E',
        assignedAgency: 'Nigeria Police Force — Ogere Divisional HQ',
        patrolOfficer: 'Rapid Intervention Team',
        isLiveTracking: true,
        notes: [
          'Distress signal registered with Palace Command Server.',
          'Patrol units in sector notified of incident coordinates.',
        ],
      });
    }
    setSearched(true);
  };

  const makeEmergencyCall = (phone: string, title: string) => {
    Alert.alert('Direct Emergency Dial', `Call ${title} (${phone})?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dial Now', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 1;
      case 'intercepting':
        return 2;
      case 'contained':
        return 3;
      case 'resolved':
        return 4;
      default:
        return 1;
    }
  };

  const stepIndex = incident ? getStatusStepIndex(incident.status) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="INCIDENT RADAR"
        subtitle="Live Dispatch & Emergency Tracking"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Box */}
        <Card style={styles.searchCard}>
          <Text style={styles.searchLabel}>Enter Incident Tracking Reference ID</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g., OGR-SOS-8419"
              placeholderTextColor="#94a3b8"
              value={searchId}
              onChangeText={setSearchId}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
              <Text style={styles.trackBtnText}>Track ➔</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.searchHint}>
            Found on your SOS receipt or Guardian Alert SMS notification.
          </Text>
        </Card>

        {incident && (
          <>
            {/* Live Radar Beacon Banner */}
            <View
              style={[
                styles.liveBanner,
                incident.isLiveTracking ? styles.liveActive : styles.liveStatic,
              ]}
            >
              <View style={styles.liveBeaconDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.liveBannerTitle}>
                  {incident.isLiveTracking
                    ? 'GUARDIAN RADAR · LIVE MOVEMENT ACTIVE'
                    : 'STATIC LAST KNOWN POSITION'}
                </Text>
                <Text style={styles.liveBannerSub}>
                  Satellite GPS: {incident.coordinates}
                </Text>
              </View>
            </View>

            {/* Incident Summary Card */}
            <Card style={styles.detailsCard}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.incidentRef}>{incident.id}</Text>
                  <Text style={styles.incidentCategory}>{incident.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    incident.status === 'intercepting'
                      ? styles.statusPillRed
                      : styles.statusPillAmber,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      incident.status === 'intercepting'
                        ? { color: '#dc2626' }
                        : { color: '#b45309' },
                    ]}
                  >
                    {incident.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.landmarkText}>📍 {incident.landmark}</Text>
              <Text style={styles.timeText}>🕒 Reported: {incident.timestamp}</Text>

              {/* Progress Flow Pipeline */}
              <View style={styles.stepperContainer}>
                {[
                  { label: 'Dispatched', active: stepIndex >= 1 },
                  { label: 'Intercepting', active: stepIndex >= 2 },
                  { label: 'Contained', active: stepIndex >= 3 },
                  { label: 'Resolved', active: stepIndex >= 4 },
                ].map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        step.active ? styles.stepDotActive : styles.stepDotInactive,
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: step.active ? '#fff' : '#94a3b8' }}>
                        {step.active ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        step.active && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Assigned Patrol Unit */}
              <View style={styles.officerBox}>
                <Text style={styles.officerLabel}>ASSIGNED PATROL COMMAND:</Text>
                <Text style={styles.officerAgency}>{incident.assignedAgency}</Text>
                <Text style={styles.officerName}>👤 {incident.patrolOfficer}</Text>
              </View>

              {/* Live Timeline SITREPs */}
              <View style={styles.timelineBox}>
                <Text style={styles.timelineHeading}>Live Dispatch Log & SITREPs:</Text>
                {incident.notes.map((note, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <Text style={styles.timelineBullet}>▪</Text>
                    <Text style={styles.timelineNote}>{note}</Text>
                  </View>
                ))}
              </View>

              {/* One-Tap Emergency Intercept Hotlines */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: '#dc2626' }]}
                  onPress={() => makeEmergencyCall('08081762371', 'Ogere Police DPO')}
                >
                  <Text style={styles.callBtnText}>📞 Call DPO Police</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: Colors.primary }]}
                  onPress={() =>
                    makeEmergencyCall('08033221144', 'Palace Vigilante Lead')
                  }
                >
                  <Text style={styles.callBtnText}>🛡️ Call Vigilante</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
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
    paddingBottom: 40,
  },
  searchCard: {
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  trackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  searchHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  liveActive: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  liveStatic: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  liveBeaconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  liveBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#86efac',
    letterSpacing: 0.5,
  },
  liveBannerSub: {
    fontSize: 11,
    color: '#dcfce7',
    marginTop: 1,
    fontFamily: 'monospace',
  },
  detailsCard: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  incidentRef: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  incidentCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillRed: {
    backgroundColor: '#fee2e2',
  },
  statusPillAmber: {
    backgroundColor: '#fef3c7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  landmarkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 14,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: '#059669',
  },
  stepDotInactive: {
    backgroundColor: '#e2e8f0',
  },
  stepLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  officerBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: 14,
  },
  officerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  officerAgency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  officerName: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  timelineBox: {
    marginBottom: 16,
  },
  timelineHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  timelineBullet: {
    color: Colors.primary,
    fontSize: 14,
    lineHeight: 16,
  },
  timelineNote: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
