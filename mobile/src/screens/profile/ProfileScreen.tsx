import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { useAuth } from '../../services/authContext';
import { syncManager } from '../../database/syncManager';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut, hasBiometrics, authenticateWithBiometrics } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const card = user?.idCard || (user ? {
    id: user.idCardNumber || `OGR-${user.id.substring(4, 10).toUpperCase()}`,
    fullName: user.fullName,
    cardType: user.citizenType,
    quarter: user.quarter || 'Oke-Ogere',
    compound: user.compound || '',
    status: 'approved',
    issuedDate: '2026-01-01',
    expiryDate: '2029-01-01',
    verifiedBy: 'HRH Ologere Palace ICT Registry',
    qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${user.idCardNumber || user.id}`,
  } : null);

  const getCategoryBadge = () => {
    if (!user) return null;
    if (user.citizenType === 'indigene') {
      if (user.indigeneResidency === 'diaspora' || (user.idCardNumber && user.idCardNumber.includes('INT'))) {
        return {
          label: `INDIGENE · DIASPORA (${user.diasporaCountry || 'INTERNATIONAL'})`,
          icon: '✈️',
          badgeBg: '#047857',
          color: '#ffffff',
          locationInfo: `Diaspora: ${user.diasporaCity ? user.diasporaCity + ', ' : ''}${user.diasporaCountry || 'Abroad'}`,
        };
      }
      if (user.indigeneResidency === 'nigeria' || (user.idCardNumber && user.idCardNumber.includes('-NG-'))) {
        return {
          label: `INDIGENE · IN NIGERIA (${user.nigeriaState || 'INTERSTATE'})`,
          icon: '🇳🇬',
          badgeBg: '#065f46',
          color: '#ffffff',
          locationInfo: `Town/City: ${user.nigeriaCity ? user.nigeriaCity + ', ' : ''}${user.nigeriaState || 'Nigeria'}`,
        };
      }
      return {
        label: 'INDIGENE · RESIDENT IN OGERE',
        icon: '👑',
        badgeBg: Colors.gold,
        color: '#ffffff',
        locationInfo: `Resident in Ogere (${user.quarter || 'Oke-Ogere'})`,
      };
    }
    if (user.citizenType === 'non-indigene') {
      return {
        label: 'NON-INDIGENE RESIDENT',
        icon: '🏢',
        badgeBg: '#2563eb',
        color: '#ffffff',
        locationInfo: user.locationSummary || `Resident in Ogere (${user.quarter || 'Oke-Ogere'})`,
      };
    }
    return {
      label: 'CERTIFIED GUEST / FRIEND OF OGERE',
      icon: '🤝',
      badgeBg: '#d97706',
      color: '#ffffff',
      locationInfo: user.guestInterest ? `${user.guestInterest} · ${user.locationSummary || 'External Stakeholder'}` : (user.locationSummary || 'Affiliated Partner'),
    };
  };

  const badgeInfo = getCategoryBadge();

  const handleManualSync = async () => {
    setSyncing(true);
    const res = await syncManager.performDeltaSync();
    setSyncing(false);
    Alert.alert(res.success ? 'Sync Complete' : 'Sync Notice', res.message);
  };

  const handleShareId = async () => {
    if (!card) return;
    try {
      await Share.share({
        title: `Official Ogere Remo Digital ID: ${card.id}`,
        message: `Kingdom of Ogere Remo — Official Digital ID Card\nHolder: ${card.fullName}\nID Number: ${card.id}\nCategory: ${card.cardType.toUpperCase()}\nStatus: APPROVED\nVerify online: ${card.qrCodeUrl}`,
      });
    } catch {}
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your citizen account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.navigate('Welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="CITIZEN WALLET" subtitle="Digital Identity & Settings" showProfile={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {user && card ? (
          <>
            {/* DIGITAL ID CARD WALLET CONTAINER */}
            <View style={styles.idCard}>
              {/* Gold Holographic Foil Header */}
              <View style={styles.idCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 26 }}>🏛️</Text>
                  <View>
                    <Text style={styles.idCardSub}>KINGDOM OF OGERE REMO</Text>
                    <Text style={styles.idCardTitle}>OFFICIAL DIGITAL IDENTITY CARD</Text>
                  </View>
                </View>
                <View style={styles.hologramSeal}>
                  <Text style={styles.hologramText}>SEAL</Text>
                </View>
              </View>

              {/* Classification Pill */}
              {badgeInfo && (
                <View style={[styles.classificationPill, { backgroundColor: badgeInfo.badgeBg }]}>
                  <Text style={{ fontSize: 13, marginRight: 4 }}>{badgeInfo.icon}</Text>
                  <Text style={[styles.classificationText, { color: badgeInfo.color }]}>
                    {badgeInfo.label}
                  </Text>
                  <Text style={styles.verifiedTag}>✓ APPROVED</Text>
                </View>
              )}

              {/* Citizen Information & Avatar */}
              <View style={styles.idCardBody}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLetter}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.citizenFullName}>{user.fullName}</Text>

                  {/* Ancestral or Affiliation Line */}
                  {user.citizenType === 'indigene' && (
                    <>
                      <Text style={styles.citizenQuarter}>
                        Ancestral Quarter: {user.quarter || 'Oke-Ogere'}
                      </Text>
                      {user.compound ? (
                        <Text style={styles.citizenCompound}>
                          Agbo-Ile: {user.compound}
                        </Text>
                      ) : null}
                    </>
                  )}

                  {/* Current Location / Residency Line */}
                  {badgeInfo?.locationInfo && (
                    <Text style={styles.locationBadgeLine}>
                      📍 {badgeInfo.locationInfo}
                    </Text>
                  )}

                  <Text style={styles.citizenValidity}>
                    Valid: {card.issuedDate} ➔ {card.expiryDate}
                  </Text>
                </View>
              </View>

              {/* Digital Barcode / Number Row */}
              <View style={styles.idCardFooter}>
                <View>
                  <Text style={styles.footerLabel}>DIGITAL CITIZEN ID NO.</Text>
                  <Text style={styles.footerCode}>{card.id}</Text>
                </View>

                {/* QR Code Icon / Visual */}
                <View style={styles.qrBox}>
                  <Text style={{ fontSize: 22 }}>📱</Text>
                  <Text style={styles.qrSub}>SCAN QR</Text>
                </View>
              </View>

              {/* Authentication Security Seal Footer */}
              <View style={styles.cardAuthorityRow}>
                <Text style={styles.cardAuthorityText}>
                  Verified by {card.verifiedBy} · ISO-27001 Certified
                </Text>
              </View>
            </View>

            {/* Quick Actions for Digital ID */}
            <View style={styles.cardActionsRow}>
              <Button
                title="Verify in Public Registry"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('VerifyId')}
                style={{ flex: 1 }}
              />
              <Button
                title="Share ID 📤"
                variant="secondary"
                size="sm"
                onPress={handleShareId}
                style={{ flex: 1 }}
              />
            </View>

            {/* Profile Information List */}
            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>Registry Account Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Citizen Affiliation</Text>
                <Text style={[styles.infoVal, { textTransform: 'capitalize' }]}>
                  {user.citizenType.replace('-', ' ')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoVal}>{user.email || 'None provided'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoVal}>{user.phone || 'None provided'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoVal, { color: '#16a34a' }]}>
                  Active & Verified ✓
                </Text>
              </View>
            </Card>
          </>
        ) : (
          /* Guest Screen View */
          <Card style={styles.guestCard}>
            <Text style={{ fontSize: 42, textAlign: 'center' }}>👤</Text>
            <Text style={styles.guestTitle}>Guest Explorer Mode</Text>
            <Text style={styles.guestSubtitle}>
              You are currently viewing public historical archives, town news, emergency lines, and directories without an account.
            </Text>
            <Text style={styles.guestClaimNotice}>
              Register as an **Indigene**, **Non-Indigene Resident**, or **Non-Resident Diaspora** to instantly receive your official certified Digital ID Card.
            </Text>

            <View style={styles.guestActions}>
              <Button
                title="Register & Get Digital ID"
                variant="secondary"
                size="lg"
                onPress={() => navigation.navigate('Register')}
              />
              <Button
                title="Sign In to Existing Account"
                variant="primary"
                onPress={() => navigation.navigate('Login')}
              />
            </View>
          </Card>
        )}

        {/* Civic Synchronization & Tools */}
        <Card style={styles.toolsCard}>
          <Text style={styles.infoTitle}>Civic Device Synchronization</Text>

          <TouchableOpacity
            style={styles.toolRow}
            onPress={handleManualSync}
            disabled={syncing}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.toolTitle}>Manual Database Sync</Text>
              <Text style={styles.toolDesc}>
                Fetch the latest palace news, business directory, and community updates.
              </Text>
            </View>
            <Text style={styles.toolActionText}>{syncing ? 'Syncing...' : 'Sync ➔'}</Text>
          </TouchableOpacity>

          {hasBiometrics && (
            <TouchableOpacity
              style={styles.toolRow}
              onPress={() => authenticateWithBiometrics()}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toolTitle}>Biometric Security (Face ID / Fingerprint)</Text>
                <Text style={styles.toolDesc}>Enabled for rapid one-touch login.</Text>
              </View>
              <Text style={styles.toolActionText}>Active ✓</Text>
            </TouchableOpacity>
          )}
        </Card>

        {user && (
          <Button
            title="Sign Out of Citizen Account"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutBtn}
            textStyle={{ color: '#dc2626' }}
          />
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
  idCard: {
    backgroundColor: '#064e3b',
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 12,
    ...Shadows.elevated,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 8,
  },
  idCardSub: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.goldSoft,
    letterSpacing: 1,
  },
  idCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  hologramSeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hologramText: {
    color: Colors.goldLight,
    fontSize: 9,
    fontWeight: '900',
  },
  classificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  classificationText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verifiedTag: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  idCardBody: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginVertical: 4,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  citizenFullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  citizenQuarter: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
    fontWeight: '600',
  },
  citizenCompound: {
    fontSize: 11,
    color: '#e2e8f0',
    marginTop: 2,
  },
  locationBadgeLine: {
    fontSize: 11,
    color: Colors.goldLight,
    fontWeight: '700',
    marginTop: 3,
  },
  citizenValidity: {
    fontSize: 10,
    color: Colors.goldSoft,
    fontWeight: '700',
    marginTop: 4,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 10,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.goldSoft,
    letterSpacing: 0.5,
  },
  footerCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  qrBox: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.sm,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
  },
  qrSub: {
    fontSize: 7,
    fontWeight: '800',
    color: '#064e3b',
    marginTop: -2,
  },
  cardAuthorityRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  cardAuthorityText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    gap: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guestCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: 10,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  guestSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  guestClaimNotice: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 18,
    backgroundColor: Colors.primaryMuted,
    padding: 10,
    borderRadius: Radius.md,
    marginVertical: 4,
  },
  guestActions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  toolsCard: {
    gap: 12,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toolDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toolActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  signOutBtn: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    marginTop: 6,
  },
});
