import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';

// Offline Verified Registry Seed (Matches PostgreSQL schema.sql seed)
const OFFLINE_REGISTRY: Record<string, any> = {
  'OGR-IND-OG-782910': {
    id: 'OGR-IND-OG-782910',
    fullName: 'Adewale Babatunde Ogunleke',
    cardType: 'indigene',
    quarter: 'Oke-Ogere',
    compound: 'Kankanbina',
    status: 'approved',
    occupation: 'Civil Engineer (Resident in Ogere)',
    issuedDate: '2024-01-15',
    expiryDate: '2027-01-15',
    verifiedBy: 'HRH Ologere Palace Office',
  },
  'OGR-782910': {
    id: 'OGR-IND-OG-782910',
    fullName: 'Adewale Babatunde Ogunleke',
    cardType: 'indigene',
    quarter: 'Oke-Ogere',
    compound: 'Kankanbina',
    status: 'approved',
    occupation: 'Civil Engineer (Resident in Ogere)',
    issuedDate: '2024-01-15',
    expiryDate: '2027-01-15',
    verifiedBy: 'HRH Ologere Palace Office',
  },
  'OGR-IND-INT-492019': {
    id: 'OGR-IND-INT-492019',
    fullName: 'Dr. Folashade Adeyemi-Clark',
    cardType: 'indigene (diaspora)',
    quarter: 'Isale-Ogere',
    compound: 'Ejigboye',
    status: 'approved',
    occupation: 'Consultant Surgeon · London, United Kingdom',
    issuedDate: '2024-03-01',
    expiryDate: '2027-03-01',
    verifiedBy: 'OCDA Diaspora Secretariat',
  },
  'OGR-D-492019': {
    id: 'OGR-IND-INT-492019',
    fullName: 'Dr. Folashade Adeyemi-Clark',
    cardType: 'indigene (diaspora)',
    quarter: 'Isale-Ogere',
    compound: 'Ejigboye',
    status: 'approved',
    occupation: 'Consultant Surgeon · London, United Kingdom',
    issuedDate: '2024-03-01',
    expiryDate: '2027-03-01',
    verifiedBy: 'OCDA Diaspora Secretariat',
  },
  'OGR-IND-NG-681920': {
    id: 'OGR-IND-NG-681920',
    fullName: 'Prince Adedeji Babington-Ashaye',
    cardType: 'indigene (in nigeria)',
    quarter: 'Oke-Ogere',
    compound: 'Legunsen Royal Compound',
    status: 'approved',
    occupation: 'Financial Executive · Ikeja, Lagos',
    issuedDate: '2024-02-10',
    expiryDate: '2027-02-10',
    verifiedBy: 'HRH Ologere Palace Office',
  },
  'OGR-RES-492019': {
    id: 'OGR-RES-492019',
    fullName: 'Chief Emeka Okafor',
    cardType: 'non-indigene',
    quarter: 'Ajura Zone',
    compound: 'Commercial Axis',
    status: 'approved',
    occupation: 'Logistics Director (Expressway Corridor)',
    issuedDate: '2023-11-12',
    expiryDate: '2026-11-12',
    verifiedBy: 'Ogere Central Community Council',
  },
  'OGR-GST-582910': {
    id: 'OGR-GST-582910',
    fullName: 'Dr. Alistair Sterling',
    cardType: 'guest / friend of ogere',
    quarter: 'External / Guest',
    compound: 'UNESCO Heritage Partner',
    status: 'approved',
    occupation: 'Cultural Heritage Researcher · Oxford, UK',
    issuedDate: '2025-01-10',
    expiryDate: '2028-01-10',
    verifiedBy: 'Palace of the Ologere ICT Registry',
  },
};

export const VerifyIdScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (queryCode?: string) => {
    const target = (queryCode || code).trim().toUpperCase();
    if (!target) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    // Try live server first
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-id?code=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          setResult(data.record);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    // Check local offline database registry
    if (OFFLINE_REGISTRY[target]) {
      setResult(OFFLINE_REGISTRY[target]);
    } else {
      setResult(null);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="ID CARD VERIFIER" subtitle="Official Community Validation" />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Card style={styles.searchCard}>
          <Text style={styles.searchTitle}>Enter ID Card Number</Text>
          <Text style={styles.searchSubtitle}>
            Test with official demo codes:{' '}
            <Text
              style={styles.sampleCode}
              onPress={() => {
                setCode('OGR-782910');
                handleVerify('OGR-782910');
              }}
            >
              OGR-782910
            </Text>{' '}
            or{' '}
            <Text
              style={styles.sampleCode}
              onPress={() => {
                setCode('OGR-D-492019');
                handleVerify('OGR-D-492019');
              }}
            >
              OGR-D-492019
            </Text>
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. OGR-782910"
              placeholderTextColor={Colors.textMuted}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <Button
              title="Verify"
              size="md"
              loading={loading}
              onPress={() => handleVerify()}
              style={{ minWidth: 90 }}
            />
          </View>
        </Card>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Querying Royal & Civic Register...</Text>
          </View>
        )}

        {!loading && searched && result && (
          <Card style={styles.resultCard}>
            <View style={styles.verifiedHeader}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ VERIFIED GENUINE</Text>
              </View>
              <Text style={styles.cardTypeBadge}>
                {result.cardType?.toUpperCase()} CARD
              </Text>
            </View>

            <Text style={styles.citizenName}>{result.fullName}</Text>
            <Text style={styles.idNumber}>ID: {result.id}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quarter</Text>
                <Text style={styles.detailValue}>{result.quarter || 'Oke-Ogere'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Compound</Text>
                <Text style={styles.detailValue}>{result.compound || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Occupation</Text>
                <Text style={styles.detailValue}>{result.occupation || 'Professional'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Valid Until</Text>
                <Text style={styles.detailValue}>{result.expiryDate || '2027-01-15'}</Text>
              </View>
            </View>

            <View style={styles.issuerBox}>
              <Text style={styles.issuerLabel}>Authenticated Authority:</Text>
              <Text style={styles.issuerName}>{result.verifiedBy}</Text>
            </View>
          </Card>
        )}

        {!loading && searched && !result && (
          <Card style={styles.notFoundCard}>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>⚠️</Text>
            <Text style={styles.notFoundTitle}>ID Card Record Not Found</Text>
            <Text style={styles.notFoundText}>
              The ID number "{code}" is not registered in the Ogere Remo Civic Database or has been flagged. Please verify the code or contact the Palace Secretariat.
            </Text>
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
    gap: 16,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  searchCard: {
    gap: 12,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  searchSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sampleCode: {
    color: Colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
    backgroundColor: Colors.surfaceSubtle,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#064e3b',
    borderColor: Colors.gold,
    borderWidth: 2,
    gap: 12,
  },
  verifiedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  cardTypeBadge: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  citizenName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  idNumber: {
    fontSize: 13,
    color: '#a7f3d0',
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: Radius.md,
  },
  detailItem: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.goldSoft,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  issuerBox: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  issuerLabel: {
    fontSize: 10,
    color: '#a7f3d0',
  },
  issuerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  notFoundCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    gap: 8,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991b1b',
  },
  notFoundText: {
    fontSize: 13,
    color: '#7f1d1d',
    textAlign: 'center',
    lineHeight: 18,
  },
});
