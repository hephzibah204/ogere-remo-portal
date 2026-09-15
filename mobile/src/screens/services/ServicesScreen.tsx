import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { useAuth } from '../../services/authContext';

export const ServicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const handleServicePress = (target: string, requiresAuth: boolean) => {
    if (requiresAuth && (!user || isGuest)) {
      setPendingTarget(target);
      setShowAuthModal(true);
      return;
    }
    navigation.navigate(target);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="CIVIC SERVICES" subtitle="Palace & Community Operations" />
      <OfflineNotice />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Public Utility Service */}
        <Card
          style={styles.featuredCard}
          onPress={() => handleServicePress('VerifyId', false)}
        >
          <View style={styles.cardIconRow}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primaryMuted }]}>
              <Text style={{ fontSize: 24 }}>🔍</Text>
            </View>
            <View style={styles.publicBadge}>
              <Text style={styles.publicBadgeText}>PUBLIC · NO LOGIN REQUIRED</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Verify Community ID Card</Text>
          <Text style={styles.cardDesc}>
            Validate the authenticity of any Ogere Indigene, Diaspora, or Resident Digital ID card in seconds.
          </Text>
          <Text style={styles.actionArrow}>Open ID Validator ➔</Text>
        </Card>

        {/* SECTION 1: TACTICAL SAFETY & RAPID RESPONSE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚨 Tactical Safety & Rapid Response</Text>
          <Text style={styles.sectionSubtitle}>
            24/7 live protection, virtual escorts, and confidential crime prevention.
          </Text>
        </View>

        {/* Virtual Safe Escort - Walk With Me */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('WalkWithMe', true)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Text style={{ fontSize: 24 }}>🚶‍♂️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Virtual Safe Escort ("Walk With Me")</Text>
              <Text style={styles.serviceDesc}>
                Moving through dark corridors? Set an arrival timer + PIN. Coerced duress PIN (9999) triggers silent armed SWAT rescue.
              </Text>
              <Text style={{ fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 4 }}>
                🟢 10-sec Heartbeat & Destination Timer
              </Text>
            </View>
          </View>
        </Card>

        {/* Incident Reporting Service */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('IncidentReport', true)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
              <Text style={{ fontSize: 24 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Report Incident or Hazard</Text>
              <Text style={styles.serviceDesc}>
                Notify security personnel and palace authorities of emergencies, robbery, terrorism, or road blockages.
              </Text>
              <Text style={styles.offlineNote}>⚡ Works offline (queued automatically)</Text>
            </View>
          </View>
        </Card>

        {/* Guardian Family Circles */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('EmergencyContacts', true)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <Text style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Guardian Circles (Emergency Contacts)</Text>
              <Text style={styles.serviceDesc}>
                Register up to 3 kin or trusted contacts. Automatically dispatched instant SMS and live GPS tracking radar on SOS distress.
              </Text>
              <Text style={{ fontSize: 11, color: '#4f46e5', fontWeight: '700', marginTop: 4 }}>
                ⚡ Auto-dispatched public live radar link
              </Text>
            </View>
          </View>
        </Card>

        {/* Anonymous Whistleblower Line */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Whistleblower', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
              <Text style={{ fontSize: 24 }}>🔒</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Anonymous Whistleblower Line</Text>
              <Text style={styles.serviceDesc}>
                Submit confidential tips on armed bandits, bunkering, or illegal arms. 100% cryptographic token tracking with officer SITREPs.
              </Text>
              <Text style={{ fontSize: 11, color: '#475569', fontWeight: '700', marginTop: 4 }}>
                🛡️ Zero identity / Zero IP logging
              </Text>
            </View>
          </View>
        </Card>

        {/* SECTION 2: ROYAL & CIVIC SERVICES */}
        <View style={[styles.sectionHeader, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>👑 Royal & Civic Operations</Text>
          <Text style={styles.sectionSubtitle}>
            Palace appointments, digital certifications, and identity verification.
          </Text>
        </View>

        {/* Royal Audience Service */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('RoyalAudience', true)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.goldSoft }]}>
              <Text style={{ fontSize: 24 }}>🏛️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Book Royal Audience with Kabiyesi</Text>
              <Text style={styles.serviceDesc}>
                Schedule private, family, or delegation appointments at Aafin Ologere.
              </Text>
              <Text style={styles.offlineNote}>⚡ Works offline (queued automatically)</Text>
            </View>
          </View>
        </Card>

        {/* Apply for Digital ID Card */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Profile', true)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primaryMuted }]}>
              <Text style={{ fontSize: 24 }}>🪪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Digital ID Card Wallet</Text>
              <Text style={styles.serviceDesc}>
                View your certified community ID badge with QR security seal.
              </Text>
            </View>
          </View>
        </Card>

        {/* SECTION 4: COMMUNITY, COMMERCE & DEVELOPMENT */}
        <View style={[styles.sectionHeader, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>💬 Community, Commerce & Endowment</Text>
          <Text style={styles.sectionSubtitle}>
            Direct messaging, town digitization, local commerce, and civic transformation.
          </Text>
        </View>

        {/* Town Messenger Service */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Messages', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Text style={{ fontSize: 24 }}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Town Messenger & 1-on-1 Chat</Text>
              <Text style={styles.serviceDesc}>
                Confidential private messaging with palace protocol, security command, OCDA, and registered community members.
              </Text>
              <Text style={{ fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 4 }}>
                🟢 Real-time database chat & channels
              </Text>
            </View>
          </View>
        </Card>

        {/* Town Map & GPS Sectors */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Map', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <Text style={{ fontSize: 24 }}>🗺️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Town Map & Digitized Sectors</Text>
              <Text style={styles.serviceDesc}>
                Explore palace landmarks, emergency sectors, health facilities, and open Google Maps navigation.
              </Text>
            </View>
          </View>
        </Card>

        {/* ₦10M Transformation Endowment */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Donation', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.goldSoft }]}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>₦10M Ogere Transformation Fund</Text>
              <Text style={styles.serviceDesc}>
                Track live endowment progress, countdown to Nov 4th 2026 launch, and support solar healthcare & streetlights.
              </Text>
              <Text style={{ fontSize: 11, color: '#c9963a', fontWeight: '800', marginTop: 4 }}>
                🎯 Target: ₦10,000,000 · Paystack & Direct Transfer
              </Text>
            </View>
          </View>
        </Card>

        {/* Local Marketplace */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Marketplace', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
              <Text style={{ fontSize: 24 }}>🛍️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Local Crafts & Adire Marketplace</Text>
              <Text style={styles.serviceDesc}>
                Browse verified local sellers for authentic Yoruba Adire indigo fabrics, farm produce, and artisan services.
              </Text>
            </View>
          </View>
        </Card>

        {/* Civic Directory */}
        <Card
          style={styles.serviceCard}
          onPress={() => handleServicePress('Directory', false)}
        >
          <View style={styles.serviceRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
              <Text style={{ fontSize: 24 }}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Civic Emergency & Business Directory</Text>
              <Text style={styles.serviceDesc}>
                Complete contact book for emergency lines, safety bulletins, and local enterprises in Ogere Remo.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Auth Prompt Modal for Guests */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>👑</Text>
            <Text style={styles.modalTitle}>Citizen Login Required</Text>
            <Text style={styles.modalText}>
              This official civic service requires an authenticated Citizen or Diaspora account to submit records to the Palace registry.
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title="Sign In with Account"
                variant="primary"
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('Login');
                }}
              />
              <Button
                title="Register New Account"
                variant="secondary"
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('Register');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowAuthModal(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  featuredCard: {
    backgroundColor: '#064e3b',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    gap: 10,
  },
  cardIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publicBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  publicBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.goldLight,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceCard: {
    gap: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  offlineNote: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 360,
    ...Shadows.elevated,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    gap: 10,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
