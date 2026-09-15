import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';

const TIP_CATEGORIES = [
  'Armed Bandits / Kidnappers',
  'Illegal Oil Bunkering',
  'Weapons & Arms Cache',
  'Corrupt Road Extortion',
  'Cultism & Violent Gangs',
  'Other Threat to Life',
];

export const WhistleblowerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Submit Tab State
  const [category, setCategory] = useState(TIP_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Track Tab State
  const [searchToken, setSearchToken] = useState('');
  const [searchPasscode, setSearchPasscode] = useState('');
  const [searching, setSearching] = useState(false);
  const [tipDetails, setTipDetails] = useState<any>(null);
  const [followupMsg, setFollowupMsg] = useState('');
  const [sendingFollowup, setSendingFollowup] = useState(false);

  const handleSubmitTip = async () => {
    if (!description.trim()) {
      Alert.alert('Details Required', 'Please provide actionable intelligence details.');
      return;
    }
    if (passcode.length < 4) {
      Alert.alert('Passcode Required', 'Please set at least a 4-digit passcode to track intelligence responses.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whistleblower`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          category,
          description: description.trim(),
          location: location.trim() || 'Ogere Remo Environs',
          passcode: passcode.trim(),
        }),
      });

      const data = await res.json();
      const token = data.token || data.tipToken;
      if (res.ok && token) {
        setGeneratedToken(token);
        setDescription('');
        setLocation('');
        setPasscode('');
      } else {
        Alert.alert('Submission Error', data.error || 'Failed to file anonymous intelligence.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not transmit anonymous intel. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackTip = async () => {
    if (!searchToken.trim()) {
      Alert.alert('Token Required', 'Please enter your secret tracking token (e.g. OGR-TIP-1234).');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/whistleblower?action=status&token=${encodeURIComponent(
          searchToken.trim().toUpperCase()
        )}&passcode=${encodeURIComponent(searchPasscode.trim())}`
      );
      const data = await res.json();
      if (res.ok && data.tip) {
        setTipDetails(data.tip);
      } else {
        Alert.alert('Not Found', data.error || 'No record matched this token and passcode combination.');
        setTipDetails(null);
      }
    } catch {
      Alert.alert('Network Error', 'Could not query intelligence database.');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFollowup = async () => {
    if (!followupMsg.trim() || !tipDetails) return;

    setSendingFollowup(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whistleblower`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'followup',
          token: tipDetails.token,
          message: followupMsg.trim(),
        }),
      });

      if (res.ok) {
        Alert.alert('Follow-Up Sent', 'Your anonymous clarification was delivered to investigators.');
        setFollowupMsg('');
        handleTrackTip();
      }
    } catch {
      Alert.alert('Error', 'Could not deliver message.');
    } finally {
      setSendingFollowup(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="WHISTLEBLOWER LINE" subtitle="100% Cryptographic Anonymity" />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'submit' && styles.tabActive]}
          onPress={() => setActiveTab('submit')}
        >
          <Text style={[styles.tabText, activeTab === 'submit' && styles.tabTextActive]}>
            ✍️ Submit Secret Intel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'track' && styles.tabActive]}
          onPress={() => setActiveTab('track')}
        >
          <Text style={[styles.tabText, activeTab === 'track' && styles.tabTextActive]}>
            🔍 Track SITREP Status
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'submit' ? (
          <>
            <Card style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <Text style={{ fontSize: 26 }}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Zero-Trace Whistleblower</Text>
                  <Text style={styles.bannerText}>
                    No name, phone number, device fingerprint, or IP address is logged. You receive a secret cryptographic Token to check security unit replies.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Token generated announcement modal/card */}
            {generatedToken ? (
              <Card style={styles.successCard}>
                <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>🛡️</Text>
                <Text style={styles.successTitle}>Intelligence Transmitted Safely</Text>
                <Text style={styles.successDesc}>
                  Your secret token has been generated. Save this token now! It is the only way to track investigation updates or chat with commanders:
                </Text>

                <View style={styles.tokenBox}>
                  <Text style={styles.tokenText}>{generatedToken}</Text>
                </View>

                <Button
                  title="Copy & Switch to Tracker"
                  variant="primary"
                  onPress={() => {
                    setSearchToken(generatedToken);
                    setGeneratedToken(null);
                    setActiveTab('track');
                  }}
                  style={{ marginTop: 12 }}
                />
              </Card>
            ) : (
              <Card style={styles.formCard}>
                <Text style={styles.fieldLabel}>INTEL CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                  {TIP_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, category === cat && styles.catChipActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>ESTIMATED LOCATION / AXIS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Near old quarry along KM 67 Expressway"
                  placeholderTextColor={Colors.textMuted}
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.fieldLabel}>INTEL DETAILS (WHAT WAS WITNESSED?)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe vehicles, license plates, weapons seen, time of sighting, hiding places..."
                  placeholderTextColor={Colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.fieldLabel}>CHOOSE A SECRET PASSCODE (TO RETRIEVE REPLIES)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4-digit PIN or memorable word"
                  placeholderTextColor={Colors.textMuted}
                  value={passcode}
                  onChangeText={setPasscode}
                  secureTextEntry
                />

                <Button
                  title={submitting ? 'Transmitting...' : '🔒 TRANSMIT ANONYMOUS INTEL'}
                  variant="primary"
                  onPress={handleSubmitTip}
                  loading={submitting}
                  style={{ marginTop: 8 }}
                />
              </Card>
            )}
          </>
        ) : (
          /* Track Tab */
          <>
            <Card style={styles.formCard}>
              <Text style={styles.fieldLabel}>SECRET TRACKING TOKEN</Text>
              <TextInput
                style={[styles.input, { letterSpacing: 2, fontWeight: '800' }]}
                placeholder="e.g. OGR-TIP-8291"
                placeholderTextColor={Colors.textMuted}
                value={searchToken}
                onChangeText={setSearchToken}
                autoCapitalize="characters"
              />

              <Text style={styles.fieldLabel}>YOUR SECRET PASSCODE</Text>
              <TextInput
                style={styles.input}
                placeholder="Passcode chosen when submitting"
                placeholderTextColor={Colors.textMuted}
                value={searchPasscode}
                onChangeText={setSearchPasscode}
                secureTextEntry
              />

              <Button
                title={searching ? 'Checking Records...' : '🔍 Check Investigation SITREP'}
                variant="primary"
                onPress={handleTrackTip}
                loading={searching}
                style={{ marginTop: 8 }}
              />
            </Card>

            {/* Found Intel Status Card */}
            {tipDetails && (
              <Card style={styles.resultCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.resultTitle}>Token: {tipDetails.token}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: tipDetails.status === 'action_taken' ? '#059669' : '#d97706' }]}>
                    <Text style={styles.statusText}>
                      {tipDetails.status?.toUpperCase() || 'LOGGED'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tipMeta}>Category: {tipDetails.category}</Text>
                <Text style={styles.tipMeta}>Area: {tipDetails.location}</Text>

                <View style={styles.sitrepBox}>
                  <Text style={styles.sitrepTitle}>OFFICER SITREP & DISPATCH STATUS</Text>
                  <Text style={styles.sitrepContent}>
                    {tipDetails.sitrep || 'Report received by Ogere Multi-Agency Intelligence Desk. Verification in progress.'}
                  </Text>
                </View>

                {/* Anonymous Follow-Up Conversation */}
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>SEND ANONYMOUS CLARIFICATION TO INVESTIGATOR</Text>
                  <TextInput
                    style={[styles.input, { height: 60, marginTop: 4 }]}
                    placeholder="Type additional details or reply to officer SITREP..."
                    placeholderTextColor={Colors.textMuted}
                    value={followupMsg}
                    onChangeText={setFollowupMsg}
                    multiline
                  />
                  <Button
                    title={sendingFollowup ? 'Sending...' : 'Send Anonymous Reply'}
                    variant="secondary"
                    onPress={handleSendFollowup}
                    loading={sendingFollowup}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </Card>
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
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: 12,
  },
  bannerCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  bannerText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
    marginTop: 2,
  },
  formCard: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 90,
  },
  catChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#064e3b',
    borderColor: Colors.gold,
    borderWidth: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  successDesc: {
    fontSize: 12,
    color: '#d1fae5',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  tokenBox: {
    backgroundColor: '#022c22',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  tokenText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.goldLight,
    letterSpacing: 3,
  },
  resultCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  tipMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sitrepBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: 10,
    borderRadius: Radius.sm,
    marginTop: 6,
  },
  sitrepTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sitrepContent: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
});
