// mobile/src/screens/services/CustomaryDisputeScreen.tsx
// Royal Customary Dispute Arbitration Portal ("Kootu Oba") for Ogere Kingdom

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
  DISPUTE_CATEGORIES,
  PALACE_ARBITRATORS,
  DisputeCase,
  getDisputes,
  fileNewDispute,
} from '../../services/customaryDisputeService';

export const CustomaryDisputeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'file' | 'arbitrators'>('cases');
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('land_boundary');
  const [title, setTitle] = useState('');
  const [plaintiffName, setPlaintiffName] = useState('');
  const [plaintiffPhone, setPlaintiffPhone] = useState('');
  const [plaintiffQuarter, setPlaintiffQuarter] = useState('Oke-Ogere');
  const [respondentName, setRespondentName] = useState('');
  const [respondentPhone, setRespondentPhone] = useState('');
  const [respondentQuarter, setRespondentQuarter] = useState('Isale-Ogere');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [oathAgreed, setOathAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const data = await getDisputes();
    setCases(data);
    setLoading(false);
  };

  const handleFileDispute = async () => {
    if (!title.trim() || !plaintiffName.trim() || !respondentName.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please fill in the title, both parties, and dispute details.');
      return;
    }
    if (!oathAgreed) {
      Alert.alert('Customary Oath Required', 'You must affirm the Traditional Customary Oath of Truth before the Royal Council.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await fileNewDispute({
        category,
        title,
        plaintiffName,
        plaintiffPhone,
        plaintiffQuarter,
        respondentName,
        respondentPhone,
        respondentQuarter,
        location,
        description,
        palaceOathAcknowledged: true,
      });

      Alert.alert(
        '📜 Petition Registered',
        `Your dispute has been assigned Tracking Code: ${created.trackingCode}. The Palace Secretariat has been notified.`,
        [{ text: 'View Cases', onPress: () => setActiveTab('cases') }]
      );
      setTitle('');
      setPlaintiffName('');
      setRespondentName('');
      setDescription('');
      setLocation('');
      setOathAgreed(false);
      loadCases();
    } catch {
      Alert.alert('Error', 'Unable to submit dispute petition. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="ROYAL CUSTOMARY DISPUTES"
        subtitle="Palace Arbitration & Boundary Council (Kootu Oba)"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'cases' && styles.tabBtnActive]}
          onPress={() => setActiveTab('cases')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'cases' && styles.tabBtnTextActive]}>
            📜 Active Cases ({cases.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'file' && styles.tabBtnActive]}
          onPress={() => setActiveTab('file')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'file' && styles.tabBtnTextActive]}>
            ✍️ File Petition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'arbitrators' && styles.tabBtnActive]}
          onPress={() => setActiveTab('arbitrators')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'arbitrators' && styles.tabBtnTextActive]}>
            👑 Arbitrators
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'cases' && (
          <View>
            <View style={styles.palaceSealBanner}>
              <Text style={{ fontSize: 24 }}>👑</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sealTitle}>Palace Customary Court of Ogere</Text>
                <Text style={styles.sealSubtitle}>
                  Presided by the Royal Arbitration Council under the authority of HRH Ologere of Ogere Remo.
                </Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
              cases.map((c) => (
                <View key={c.id} style={styles.caseCard}>
                  <View style={styles.caseHeader}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{c.trackingCode}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            c.status === 'ROYAL_DECREE_ISSUED'
                              ? '#dcfce7'
                              : c.status === 'HEARING_SCHEDULED'
                              ? '#fef3c7'
                              : '#e0f2fe',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              c.status === 'ROYAL_DECREE_ISSUED'
                                ? '#15803d'
                                : c.status === 'HEARING_SCHEDULED'
                                ? '#b45309'
                                : '#0369a1',
                          },
                        ]}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.caseTitle}>{c.title}</Text>
                  <Text style={styles.caseMeta}>
                    👤 Complainant: <Text style={{ fontWeight: '700' }}>{c.plaintiffName}</Text> ({c.plaintiffQuarter})
                  </Text>
                  <Text style={styles.caseMeta}>
                    👥 Respondent: <Text style={{ fontWeight: '700' }}>{c.respondentName}</Text> ({c.respondentQuarter})
                  </Text>
                  <Text style={styles.caseDesc}>{c.description}</Text>

                  {c.decreeSummary && (
                    <View style={styles.decreeBox}>
                      <Text style={styles.decreeTitle}>👑 ROYAL ARBITRATION DECREE</Text>
                      <Text style={styles.decreeText}>{c.decreeSummary}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'file' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>File Customary Dispute Petition</Text>

            <Text style={styles.label}>Dispute Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {DISPUTE_CATEGORIES.map((cat) => (
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

            <Text style={styles.label}>Dispute Subject / Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Boundary Demarcation on Agbele Farm Road"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Complainant Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Full Name"
                  placeholderTextColor="#94a3b8"
                  value={plaintiffName}
                  onChangeText={setPlaintiffName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Your Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="080..."
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={plaintiffPhone}
                  onChangeText={setPlaintiffPhone}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Respondent (Opposing) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Opposing Party Name"
                  placeholderTextColor="#94a3b8"
                  value={respondentName}
                  onChangeText={setRespondentName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Respondent Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="080..."
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={respondentPhone}
                  onChangeText={setRespondentPhone}
                />
              </View>
            </View>

            <Text style={styles.label}>Location / Street / Farmland Coordinates</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Plot 4B, Agbele Road, Ogere Remo"
              placeholderTextColor="#94a3b8"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Detailed Statement of Facts *</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Provide history of the dispute, previous customary agreements, witnesses, and desired resolution..."
              placeholderTextColor="#94a3b8"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Customary Oath Checkbox */}
            <TouchableOpacity
              style={styles.oathBox}
              onPress={() => setOathAgreed(!oathAgreed)}
            >
              <Text style={{ fontSize: 18 }}>{oathAgreed ? '☑️' : '⬜'}</Text>
              <Text style={styles.oathText}>
                I solemnly swear by Ogere ancestral heritage and truth that the facts stated above are accurate, and I submit to customary arbitration by the Palace Royal Council.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleFileDispute}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>📜 File Petition with Palace Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'arbitrators' && (
          <View>
            <Text style={styles.formHeading}>Palace Customary Bench & Arbitrators</Text>
            {PALACE_ARBITRATORS.map((arb) => (
              <View key={arb.id} style={styles.arbCard}>
                <Text style={{ fontSize: 32 }}>{arb.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.arbName}>{arb.name}</Text>
                  <Text style={styles.arbTitle}>{arb.title}</Text>
                  <Text style={styles.arbRank}>{arb.rank} · {arb.quarter}</Text>
                  <Text style={styles.arbSpec}>⚖️ Specialty: {arb.specialty}</Text>
                </View>
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
    borderBottomColor: '#C9963A',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#C9963A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  palaceSealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(201, 150, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 150, 58, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sealTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9963A',
  },
  sealSubtitle: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
  },
  caseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: 'rgba(201, 150, 58, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C9963A',
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
  caseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  caseMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  caseDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 6,
  },
  decreeBox: {
    marginTop: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 6,
    padding: 8,
  },
  decreeTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4ade80',
    marginBottom: 2,
  },
  decreeText: {
    fontSize: 11,
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#C9963A',
    marginBottom: 14,
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
    backgroundColor: 'rgba(201, 150, 58, 0.2)',
    borderColor: '#C9963A',
  },
  catPillText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  catPillTextActive: {
    color: '#C9963A',
    fontWeight: '700',
  },
  oathBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(201, 150, 58, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 150, 58, 0.25)',
    padding: 10,
    borderRadius: 6,
    marginVertical: 12,
  },
  oathText: {
    flex: 1,
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: '#C9963A',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  arbCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    alignItems: 'center',
  },
  arbName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  arbTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9963A',
  },
  arbRank: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  arbSpec: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 4,
  },
});
