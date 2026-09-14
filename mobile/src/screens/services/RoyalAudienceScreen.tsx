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
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';
import { useAuth } from '../../services/authContext';
import { syncManager, API_BASE_URL } from '../../database/syncManager';
import { queueOfflineSubmission } from '../../database/sqlite';

const PURPOSES = [
  'Royal Homage & Courtesy Call',
  'Diaspora Community Development',
  'Chieftaincy & Heritage Inquiries',
  'Family Land / Dispute Resolution',
  'Business & Investment Proposal',
];

export const RoyalAudienceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [bookingDate, setBookingDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [groupSize, setGroupSize] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Tracking State
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim() || !message.trim()) {
      Alert.alert(
        'Missing Information',
        'Please complete all required fields: Full Name, Phone, Email, Residential Address, and Purpose Details.'
      );
      return;
    }

    setLoading(true);
    const payload = {
      action: 'create',
      fullName,
      phone,
      email,
      address,
      purpose,
      preferredDate: bookingDate,
      preferredTime: timeSlot,
      groupSize,
      message,
      userId: user?.id,
    };

    const isOnline = syncManager.getOnlineStatus();

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/royal-audiences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          Alert.alert(
            '👑 Royal Audience Requested',
            `Your request has been logged under Reference: ${data.reference || 'Generated'}.\n\nAn official acknowledgement email has been dispatched to ${email}.`,
            [
              {
                text: 'Track Appointment',
                onPress: () => {
                  setTrackingCode(data.reference || '');
                  setActiveTab('track');
                },
              },
              { text: 'Done', onPress: () => navigation.goBack() },
            ]
          );
          setLoading(false);
          return;
        }
      } catch {}
    }

    // Fallback: Queue offline
    await queueOfflineSubmission('audience', { ...payload, id: `AUD-${Date.now()}` });
    setLoading(false);
    Alert.alert(
      'Saved Offline',
      'You are currently offline. Your appointment request has been saved securely on your device and will dispatch automatically once internet connection is restored.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleTrack = async () => {
    if (!trackingCode.trim()) {
      Alert.alert('Reference Required', 'Please enter your booking reference or registered email.');
      return;
    }

    setTrackingLoading(true);
    setTrackingError('');
    setTrackedRecord(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/royal-audiences?action=track&code=${encodeURIComponent(trackingCode.trim())}`
      );
      const data = await res.json();

      if (res.ok && data.booking) {
        setTrackedRecord(data.booking);
      } else {
        setTrackingError(data.error || 'No appointment found with this reference code or email.');
      }
    } catch {
      setTrackingError('Unable to connect to Palace server. Please check internet connection.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="PALACE AUDIENCE" subtitle="Aafin Ologere Appointment Desk" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Services</Text>
        </TouchableOpacity>

        {/* Tab switch */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
          <TouchableOpacity
            onPress={() => setActiveTab('book')}
            style={[
              styles.tabBtn,
              activeTab === 'book' && styles.tabBtnActive,
            ]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'book' && styles.tabBtnTextActive]}>
              👑 Book Audience
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('track')}
            style={[
              styles.tabBtn,
              activeTab === 'track' && styles.tabBtnActive,
            ]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'track' && styles.tabBtnTextActive]}>
              🔍 Track Status
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.palaceCard}>
          <View style={styles.palaceHeader}>
            <Text style={{ fontSize: 24 }}>🏛️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.palaceTitle}>Palace of the Ologere</Text>
              <Text style={styles.palaceSubtitle}>Royal Audience with HRH Oba James Obafemi Saliu</Text>
            </View>
          </View>
          <Text style={styles.palaceDesc}>
            Official Palace Secretariat appointment registry. Royal decisions and electronic gate vouchers are updated in real-time.
          </Text>
        </Card>

        {activeTab === 'track' ? (
          <Card style={styles.formCard}>
            <Text style={styles.sectionHeader}>Palace Appointment Lookup</Text>
            <Text style={styles.fieldHint}>
              Enter your Reference Code (e.g. AUD-2026-XXXX) or registered email address:
            </Text>
            <TextInput
              style={styles.input}
              value={trackingCode}
              onChangeText={setTrackingCode}
              placeholder="e.g. AUD-2026-8794 or chief@example.com"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            <Button
              title="Verify Appointment"
              variant="primary"
              size="md"
              loading={trackingLoading}
              onPress={handleTrack}
            />

            {trackingError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{trackingError}</Text>
              </View>
            ) : null}

            {trackedRecord && (
              <View style={styles.trackedResultBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.refText}>{trackedRecord.reference_number || trackedRecord.reference}</Text>
                  <View style={[
                    styles.statusBadge,
                    trackedRecord.status === 'confirmed' ? styles.statusConfirmed :
                    trackedRecord.status === 'postponed' ? styles.statusPostponed :
                    trackedRecord.status === 'declined' ? styles.statusDeclined : styles.statusPending
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {(trackedRecord.status || 'PENDING').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.trackField}><Text style={styles.trackLabel}>Applicant: </Text>{trackedRecord.full_name || trackedRecord.applicant}</Text>
                <Text style={styles.trackField}><Text style={styles.trackLabel}>Purpose: </Text>{trackedRecord.purpose}</Text>
                <Text style={styles.trackField}><Text style={styles.trackLabel}>Confirmed Date: </Text>{trackedRecord.confirmed_date || trackedRecord.scheduled_date || 'Awaiting Confirmation'}</Text>
                <Text style={styles.trackField}><Text style={styles.trackLabel}>Chamber: </Text>{trackedRecord.palace_chamber || 'To Be Assigned'}</Text>

                {trackedRecord.notes ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>👑 Palace Secretariat Notes:</Text>
                    <Text style={styles.noteContent}>{trackedRecord.notes}</Text>
                  </View>
                ) : null}
                {trackedRecord.postponed_reason ? (
                  <View style={[styles.noteBox, { borderColor: '#f59e0b' }]}>
                    <Text style={[styles.noteTitle, { color: '#f59e0b' }]}>⚠️ Reschedule Reason:</Text>
                    <Text style={styles.noteContent}>{trackedRecord.postponed_reason}</Text>
                  </View>
                ) : null}
                {trackedRecord.decline_reason ? (
                  <View style={[styles.noteBox, { borderColor: '#ef4444' }]}>
                    <Text style={[styles.noteTitle, { color: '#ef4444' }]}>Palace Response:</Text>
                    <Text style={styles.noteContent}>{trackedRecord.decline_reason}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Applicant Full Name *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. High Chief Olumide Sobukonla"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="08034512345"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address * (For Royal Gate Pass)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="applicant@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Residential / Diaspora Address *</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="House No., Street Name, City, State/Country"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Purpose of Audience</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.purposeScroll}>
                {PURPOSES.map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPurpose(p)}
                    style={[styles.purposeChip, purpose === p && styles.purposeChipActive]}
                  >
                    <Text style={[styles.purposeText, purpose === p && styles.purposeTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Preferred Date</Text>
                <TextInput
                  style={styles.input}
                  value={bookingDate}
                  onChangeText={setBookingDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Group Size</Text>
                <TextInput
                  style={styles.input}
                  value={groupSize}
                  onChangeText={setGroupSize}
                  placeholder="1"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Detailed Brief / Matters for Kabiyesi *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="State the purpose of your visit and key matters to discuss with HRH..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            <Button
              title="👑 Submit Audience Request"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit}
              style={{ marginTop: 8 }}
            />
          </Card>
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
  palaceCard: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: Colors.gold,
    gap: 8,
  },
  palaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  palaceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  palaceSubtitle: {
    fontSize: 12,
    color: Colors.goldLight,
  },
  palaceDesc: {
    fontSize: 12,
    color: '#a7f3d0',
    lineHeight: 17,
  },
  formCard: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  purposeScroll: {
    flexDirection: 'row',
  },
  purposeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  purposeChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  purposeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  purposeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  errorBox: {
    padding: 10,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
  },
  trackedResultBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  refText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  trackField: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  trackLabel: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusPostponed: {
    backgroundColor: '#fef3c7',
  },
  statusDeclined: {
    backgroundColor: '#fee2e2',
  },
  statusPending: {
    backgroundColor: '#f1f5f9',
  },
  noteBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: Radius.sm,
    backgroundColor: '#ffffff',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    gap: 4,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  noteContent: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
});
