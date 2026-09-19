// mobile/src/screens/services/FixMyStreetScreen.tsx
// Civic Infrastructure & IBEDC Grid Power Monitor for Ogere Remo Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { Header } from '../../components/Header';
import {
  ISSUE_CATEGORIES,
  OGERE_QUARTERS,
  StreetIssue,
  getStreetIssues,
  reportStreetIssue,
  upvoteIssue,
} from '../../services/fixMyStreetService';
import { getExactDeviceLocation } from '../../services/locationService';

export const FixMyStreetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'report' | 'power'>('feed');
  const [issues, setIssues] = useState<StreetIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Report Form State
  const [category, setCategory] = useState('pothole_road');
  const [title, setTitle] = useState('');
  const [quarter, setQuarter] = useState('Oke-Ogere');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    const data = await getStreetIssues();
    setIssues(data);
    setLoading(false);
  };

  const handleAcquireGps = async () => {
    try {
      const loc = await getExactDeviceLocation();
      setCoords({ lat: loc.latitude, lng: loc.longitude });
      setLocation(`GPS: ${loc.latitude.toFixed(5)}°N, ${loc.longitude.toFixed(5)}°E`);
      Alert.alert('GPS Locked', `Coordinates tagged: ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`);
    } catch {
      Alert.alert('GPS Error', 'Please enable location permissions.');
    }
  };

  const handleReport = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please provide an issue title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await reportStreetIssue({
        title,
        category,
        quarter,
        location: location || 'Ogere Remo',
        latitude: coords?.lat || 6.9371,
        longitude: coords?.lng || 3.6335,
        severity,
        reporterName: reporterName || 'Concerned Citizen',
        description,
      });

      Alert.alert('✅ Issue Logged', `Issue #${created.id} reported to OCDA Public Works & assigned contractors.`);
      setTitle('');
      setDescription('');
      setLocation('');
      setActiveTab('feed');
      loadIssues();
    } catch {
      Alert.alert('Error', 'Unable to log issue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    const updated = await upvoteIssue(id);
    setIssues(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="FIX MY STREET"
        subtitle="Civic Infrastructure & IBEDC Grid Monitor"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'feed' && styles.tabBtnTextActive]}>
            🚧 Tracked Issues ({issues.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'report' && styles.tabBtnActive]}
          onPress={() => setActiveTab('report')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'report' && styles.tabBtnTextActive]}>
            📢 Report Problem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'power' && styles.tabBtnActive]}
          onPress={() => setActiveTab('power')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'power' && styles.tabBtnTextActive]}>
            ⚡ IBEDC Power Grid
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'feed' && (
          <View>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
              issues.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.idBadge}>
                      <Text style={styles.idText}>{item.id}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === 'RESOLVED'
                              ? '#dcfce7'
                              : item.status === 'IN_PROGRESS'
                              ? '#fef3c7'
                              : '#fee2e2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              item.status === 'RESOLVED'
                                ? '#15803d'
                                : item.status === 'IN_PROGRESS'
                                ? '#b45309'
                                : '#b91c1c',
                          },
                        ]}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemLoc}>📍 {item.location} ({item.quarter})</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>

                  {item.assignedContractor && (
                    <View style={styles.contractorBox}>
                      <Text style={styles.contractorLabel}>👷 ASSIGNED CONTRACTOR</Text>
                      <Text style={styles.contractorName}>{item.assignedContractor}</Text>
                      <Text style={styles.contractorEta}>⏳ ETA: {item.contractorEta}</Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.upvoteBtn}
                      onPress={() => handleUpvote(item.id)}
                    >
                      <Text style={styles.upvoteText}>🔺 Upvote ({item.upvotes})</Text>
                    </TouchableOpacity>
                    <Text style={styles.severityText}>Severity: {item.severity}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'report' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Report Civic Fault or Infrastructure Issue</Text>

            <Text style={styles.label}>Issue Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {ISSUE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={[styles.catPill, category === cat.id && styles.catPillActive]}
                  >
                    <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
                    <Text style={[styles.catPillText, category === cat.id && styles.catPillTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Issue Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Broken Culvert near Central Market"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Town Quarter</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Oke-Ogere / Isale-Ogere"
                  placeholderTextColor="#94a3b8"
                  value={quarter}
                  onChangeText={setQuarter}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Reporter Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name (Optional)"
                  placeholderTextColor="#94a3b8"
                  value={reporterName}
                  onChangeText={setReporterName}
                />
              </View>
            </View>

            <Text style={styles.label}>Location / Street Address</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Specific Street, Junction, Pole No."
                placeholderTextColor="#94a3b8"
                value={location}
                onChangeText={setLocation}
              />
              <TouchableOpacity style={styles.gpsBtn} onPress={handleAcquireGps}>
                <Text style={{ fontSize: 14 }}>🎯</Text>
                <Text style={styles.gpsBtnText}>GPS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Description of Damage & Impact *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Describe what is broken, hazards, number of affected households..."
              placeholderTextColor="#94a3b8"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleReport}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>📢 Submit Infrastructure Report</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'power' && (
          <View>
            <Text style={styles.formHeading}>Live IBEDC Feeder & Transformer Status</Text>
            {OGERE_QUARTERS.map((q) => (
              <View key={q.id} style={styles.powerCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.powerName}>{q.name}</Text>
                  <View
                    style={[
                      styles.powerPill,
                      { backgroundColor: q.powerStatus === 'ON' ? '#dcfce7' : '#fee2e2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.powerPillText,
                        { color: q.powerStatus === 'ON' ? '#15803d' : '#b91c1c' },
                      ]}
                    >
                      {q.powerStatus === 'ON' ? '⚡ POWER ON' : '🌑 BLACKOUT'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.powerMeta}>🔌 Substation: {q.transformer}</Text>
                <Text style={styles.powerMeta}>📊 Grid Load: {q.loadRating}</Text>
                <Text style={styles.powerMeta}>🕒 Last status change: {q.lastPowerChange}</Text>
              </View>
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
    backgroundColor: '#0f172a',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#38bdf8',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#38bdf8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  itemLoc: {
    fontSize: 11,
    color: '#38bdf8',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  contractorBox: {
    marginTop: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 6,
    padding: 8,
  },
  contractorLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38bdf8',
    marginBottom: 2,
  },
  contractorName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  contractorEta: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  upvoteBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  severityText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  formContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  catPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38bdf8',
  },
  catPillText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  catPillTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  gpsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  powerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  powerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  powerPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  powerPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  powerMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
});
