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
import { useAuth } from '../../services/authContext';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signIn, authenticateWithBiometrics, hasBiometrics, setGuestMode } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signIn(identifier.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      // In production, biometrics retrieves saved token from SecureStore
      Alert.alert('Biometric Verified', 'Welcome back, Citizen!');
    } else {
      Alert.alert('Authentication Failed', 'Biometrics could not be verified. Use your password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.sealBadge}>
              <Text style={styles.sealText}>👑</Text>
            </View>
            <Text style={styles.title}>Citizen Sign In</Text>
            <Text style={styles.subtitle}>
              Access your digital ID card, royal appointments, and civic dashboard.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email Address or Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. adewale@gmail.com or 08034512345"
                placeholderTextColor={Colors.textMuted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => Alert.alert('Password Reset', 'Please contact the Palace ICT Secretariat at ict@ogereremo.gov.ng')}>
                  <Text style={styles.forgotText}>Forgot?</Text>
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
              title="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            {hasBiometrics && (
              <Button
                title="Unlock with Face ID / Biometrics"
                variant="outline"
                size="md"
                onPress={handleBiometricAuth}
                style={styles.bioBtn}
              />
            )}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => setGuestMode(true)}
              style={styles.guestAction}
              activeOpacity={0.7}
            >
              <Text style={styles.guestActionText}>
                Continue as Guest (Read-Only)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account yet?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register as Citizen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  backBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  sealBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sealText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.card,
    gap: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
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
  submitBtn: {
    marginTop: 4,
  },
  bioBtn: {
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  guestAction: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
