import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { useAdminAuth, OfficerRole } from '../../services/adminAuthContext';

const DEPARTMENTS = [
  {
    role: 'security_officer' as OfficerRole,
    agencies: [
      'Nigeria Police Force (Ogere Divisional Command)',
      'Federal Road Safety Corps (FRSC Ogere Corridor)',
      'So-Safe Corps (Ogere Zonal Area Command)',
      'Aafin Ologere Joint Vigilante Night Watch',
    ],
  },
  {
    role: 'palace_protocol' as OfficerRole,
    agencies: [
      'Aafin Ologere Protocol Secretariat',
      'King’s Chamberlains & Audience Directorate',
      'Council of Chiefs Ceremonial Unit',
    ],
  },
  {
    role: 'ocda_admin' as OfficerRole,
    agencies: [
      'Ogere Community Development Association (OCDA)',
      'Digital Citizen ID Registration Unit',
      'Land & Property Dispute Bureau',
      'Emergency Civic Broadcast Command',
    ],
  },
];

export const AdminRegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUpOfficer } = useAdminAuth();
  const [selectedRole, setSelectedRole] = useState<OfficerRole>('security_officer');
  const [agencyName, setAgencyName] = useState(DEPARTMENTS[0].agencies[0]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [agencyAccessKey, setAgencyAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAgencies = DEPARTMENTS.find(d => d.role === selectedRole)?.agencies || [];

  const handleRoleSelect = (role: OfficerRole) => {
    setSelectedRole(role);
    const ag = DEPARTMENTS.find(d => d.role === role)?.agencies[0] || '';
    setAgencyName(ag);
    // Prefill suggested badge format
    if (role === 'security_officer') setBadgeNumber('NPF-OG-' + Math.floor(1000 + Math.random() * 9000));
    else if (role === 'palace_protocol') setBadgeNumber('PAL-PRO-' + Math.floor(10 + Math.random() * 90));
    else setBadgeNumber('OCDA-ADM-' + Math.floor(100 + Math.random() * 900));
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !badgeNumber.trim() || !password) {
      setError('Please complete all official credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signUpOfficer({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: selectedRole,
      agencyName,
      badgeNumber: badgeNumber.trim().toUpperCase(),
      agencyAccessKey: agencyAccessKey.trim(),
    });

    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Officer Verified & Enrolled',
        `Official badge ${badgeNumber} registered under ${agencyName}. You are now signed in.`,
        [
          {
            text: 'Launch Command Console',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'AdminDashboard' }],
              });
            },
          },
        ]
      );
    } else {
      setError(res.error || 'Registration failed. Check access key.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back to Login</Text>
            </TouchableOpacity>
            
            <View style={styles.sealBadge}>
              <Text style={{ fontSize: 30 }}>🛡️</Text>
            </View>
            <Text style={styles.title}>Officer & Staff Enrollment</Text>
            <Text style={styles.subtitle}>
              Register official government, security, or palace credentials to receive a field duty terminal.
            </Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleTabs}>
            <TouchableOpacity
              onPress={() => handleRoleSelect('security_officer')}
              style={[styles.roleTab, selectedRole === 'security_officer' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>👮‍♂️</Text>
              <Text style={[styles.roleTabText, selectedRole === 'security_officer' && styles.roleTabTextActive]}>
                Security Forces
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleSelect('palace_protocol')}
              style={[styles.roleTab, selectedRole === 'palace_protocol' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>👑</Text>
              <Text style={[styles.roleTabText, selectedRole === 'palace_protocol' && styles.roleTabTextActive]}>
                Palace Protocol
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleSelect('ocda_admin')}
              style={[styles.roleTab, selectedRole === 'ocda_admin' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>🏛️</Text>
              <Text style={[styles.roleTabText, selectedRole === 'ocda_admin' && styles.roleTabTextActive]}>
                OCDA Admin
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Full Official Name (With Rank/Title) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ASP Babatunde Oladipo or Chief Adebisi Adeleke"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Agency / Command Unit *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {currentAgencies.map((ag, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setAgencyName(ag)}
                    style={[styles.agencyChip, agencyName === ag && styles.agencyChipActive]}
                  >
                    <Text style={[styles.agencyChipText, agencyName === ag && styles.agencyChipTextActive]}>
                      {ag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Official Badge / Service ID *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. NPF-OG-4891"
                  placeholderTextColor={Colors.textMuted}
                  value={badgeNumber}
                  onChangeText={setBadgeNumber}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Official Phone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08031234567"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Official Government / Palace Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="officer@ogereremo.org"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Terminal Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.label}>Agency Access Authorization Key *</Text>
                <Text style={{ fontSize: 10, color: Colors.gold }}>Demo: OGERE2026</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Authorization Passkey (e.g. OGERE-SEC-2026)"
                placeholderTextColor={Colors.textMuted}
                value={agencyAccessKey}
                onChangeText={setAgencyAccessKey}
                autoCapitalize="characters"
              />
            </View>

            <Button
              title="Submit Credentials & Enroll Terminal"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
              style={{ marginTop: 6, backgroundColor: '#b45309' }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0503',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '700',
  },
  sealBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(201,150,58,0.15)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(245,237,216,0.6)',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
    lineHeight: 16,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTabActive: {
    backgroundColor: 'rgba(201,150,58,0.2)',
    borderColor: Colors.gold,
  },
  roleTabEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  roleTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(245,237,216,0.6)',
    textAlign: 'center',
  },
  roleTabTextActive: {
    color: Colors.gold,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#160d07',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.3)',
    gap: 12,
    ...Shadows.card,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  field: {
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderColor: 'rgba(201,150,58,0.3)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  agencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.2)',
    marginRight: 6,
  },
  agencyChipActive: {
    backgroundColor: 'rgba(201,150,58,0.25)',
    borderColor: Colors.gold,
  },
  agencyChipText: {
    fontSize: 11,
    color: 'rgba(245,237,216,0.7)',
  },
  agencyChipTextActive: {
    color: Colors.goldLight,
    fontWeight: '700',
  },
});
