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

export const AdminLoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signInOfficer, authenticateWithBiometrics, hasBiometrics } = useAdminAuth();
  const [selectedRole, setSelectedRole] = useState<OfficerRole>('security_officer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Please enter your badge number or email, and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signInOfficer(identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AdminDashboard' }],
      });
    } else {
      setError(res.error || 'Authentication rejected. Check credentials.');
    }
  };

  const handleFastDemo = (role: OfficerRole) => {
    if (role === 'security_officer') {
      setIdentifier('police@ogereremo.org');
      setPassword('security2026');
      setSelectedRole('security_officer');
    } else if (role === 'palace_protocol') {
      setIdentifier('protocol@ogereremo.org');
      setPassword('palace2026');
      setSelectedRole('palace_protocol');
    } else {
      setIdentifier('admin@ogereremo.org');
      setPassword('ocda2026');
      setSelectedRole('ocda_admin');
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      handleFastDemo(selectedRole);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Official Command Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Citizen Portal</Text>
            </TouchableOpacity>
            
            <View style={styles.sealBadge}>
              <Text style={{ fontSize: 32 }}>🏛️</Text>
            </View>
            <Text style={styles.stateSubtitle}>OGUN STATE · FEDERAL REPUBLIC OF NIGERIA</Text>
            <Text style={styles.title}>Field Command & Secretariat</Text>
            <Text style={styles.subtitle}>
              Authorized Portal for Security Forces, Palace Protocol & Civic Administrators
            </Text>
          </View>

          {/* Role Filter Tabs */}
          <View style={styles.roleTabs}>
            <TouchableOpacity
              onPress={() => { setSelectedRole('security_officer'); handleFastDemo('security_officer'); }}
              style={[styles.roleTab, selectedRole === 'security_officer' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>🛡️</Text>
              <Text style={[styles.roleTabText, selectedRole === 'security_officer' && styles.roleTabTextActive]}>
                Security / Police
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSelectedRole('palace_protocol'); handleFastDemo('palace_protocol'); }}
              style={[styles.roleTab, selectedRole === 'palace_protocol' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>👑</Text>
              <Text style={[styles.roleTabText, selectedRole === 'palace_protocol' && styles.roleTabTextActive]}>
                Palace Protocol
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSelectedRole('ocda_admin'); handleFastDemo('ocda_admin'); }}
              style={[styles.roleTab, selectedRole === 'ocda_admin' && styles.roleTabActive]}
            >
              <Text style={styles.roleTabEmoji}>🏛️</Text>
              <Text style={[styles.roleTabText, selectedRole === 'ocda_admin' && styles.roleTabTextActive]}>
                OCDA Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Card */}
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Badge Number / Official Email</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. NPF-OG-4891 or police@ogereremo.org"
                placeholderTextColor={Colors.textMuted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Access Password / Key</Text>
                <TouchableOpacity onPress={() => Alert.alert('Officer Credential Recovery', 'Please report to the Palace ICT Directorate or Divisional Police Command for password resets.')}>
                  <Text style={styles.forgotText}>Lost Credentials?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button
              title="Authenticate & Enter Command Console"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            {hasBiometrics && (
              <Button
                title="⚡ Unlock with Face ID / Biometrics"
                variant="outline"
                size="md"
                onPress={handleBiometricAuth}
                style={{ marginTop: 8 }}
              />
            )}

            {/* Fast Demo Autofill Helper */}
            <View style={styles.demoHelperBox}>
              <Text style={styles.demoHelperTitle}>Fast Testing Credentials (Tap to Fill):</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity onPress={() => handleFastDemo('security_officer')} style={styles.demoChip}>
                  <Text style={styles.demoChipText}>👮 Police Patrol</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFastDemo('palace_protocol')} style={styles.demoChip}>
                  <Text style={styles.demoChipText}>👑 Palace Officer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFastDemo('ocda_admin')} style={styles.demoChip}>
                  <Text style={styles.demoChipText}>🏛️ OCDA Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New Field Officer or Palace Official? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminRegister')}>
                <Text style={styles.registerLink}>Register Officer ➔</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '700',
  },
  sealBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(201,150,58,0.15)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  stateSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(245,237,216,0.6)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.md,
    lineHeight: 17,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
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
    marginBottom: 3,
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
    gap: 14,
    ...Shadows.md,
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
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(201,150,58,0.3)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  submitBtn: {
    marginTop: 6,
    backgroundColor: '#b45309',
  },
  demoHelperBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(201,150,58,0.3)',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 4,
    gap: 6,
  },
  demoHelperTitle: {
    fontSize: 11,
    color: 'rgba(245,237,216,0.6)',
    fontWeight: '700',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  demoChip: {
    backgroundColor: 'rgba(201,150,58,0.15)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.3)',
  },
  demoChipText: {
    fontSize: 11,
    color: Colors.goldLight,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(245,237,216,0.6)',
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.gold,
  },
});
