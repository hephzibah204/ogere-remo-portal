import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { API_BASE_URL } from '../../database/syncManager';

const TARGET_AMOUNT = 10000000; // ₦10,000,000
const LAUNCH_DATE = new Date('2026-11-04T00:00:00Z');

const PRESETS = [5000, 10000, 25000, 50000, 100000, 250000];

const PILLARS = [
  {
    icon: '☀️',
    title: 'Health Centre Solar Grid',
    desc: '24-hour uninterrupted solar electricity for labor & pediatric cold-chain vaccine storage.',
    allocation: '₦3.5M Target',
  },
  {
    icon: '💡',
    title: 'Street Illumination & Safety',
    desc: 'Solar LED street lamps across Oke-Ogere, Isale, and dark corridor axes.',
    allocation: '₦2.5M Target',
  },
  {
    icon: '💻',
    title: 'Youth Innovation Lab',
    desc: 'Equipping 50 high-speed coding workstations for Ogere youth digital literacy.',
    allocation: '₦2.0M Target',
  },
  {
    icon: '🏺',
    title: 'Adire Heritage Centre',
    desc: 'Preserving authentic Yoruba indigo dyeing crafts & youth vocational mentorship.',
    allocation: '₦2.0M Target',
  },
];

export const DonationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [totalRaised, setTotalRaised] = useState(3850000);
  const [donorCount, setDonorCount] = useState(142);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // 1. Fetch real-time donation stats from Neon DB
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/donations?stats=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.total_raised) setTotalRaised(Number(data.total_raised));
          if (data.donor_count) setDonorCount(Number(data.donor_count));
        }
      } catch (_) {}
    };
    fetchStats();
  }, []);

  // 2. Countdown timer to November 4th, 2026
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, LAUNCH_DATE.getTime() - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, mins, secs });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round((totalRaised / TARGET_AMOUNT) * 100));

  const handleDonate = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount || 10000;
    // Open web portal donation page with prefilled amount for secure 3D-secure Paystack checkout
    const url = `https://ogereremo.vercel.app/donate?amount=${amount}&name=${encodeURIComponent(donorName)}&email=${encodeURIComponent(donorEmail)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="COMMUNITY ENDOWMENT"
        subtitle="₦10M Ogere Remo Transformation Fund"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Launch Countdown Banner */}
        <View style={styles.countdownBanner}>
          <Text style={styles.countdownLabel}>🚀 OFFICIAL PORTAL LAUNCH COUNTDOWN (NOV 4, 2026)</Text>
          <View style={styles.timerRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeNum}>{timeRemaining.days}</Text>
              <Text style={styles.timeUnit}>DAYS</Text>
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeNum}>{timeRemaining.hours}</Text>
              <Text style={styles.timeUnit}>HOURS</Text>
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeNum}>{timeRemaining.mins}</Text>
              <Text style={styles.timeUnit}>MINS</Text>
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeNum}>{timeRemaining.secs}</Text>
              <Text style={styles.timeUnit}>SECS</Text>
            </View>
          </View>
        </View>

        {/* Campaign Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={styles.statLabel}>TOTAL RAISED SO FAR</Text>
              <Text style={styles.amountText}>₦{totalRaised.toLocaleString()}</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}% FUNDED</Text>
            </View>
          </View>

          {/* Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.progressFooterRow}>
            <Text style={styles.footerNote}>🎯 Target: ₦10,000,000</Text>
            <Text style={styles.footerNote}>👥 {donorCount} Verified Indigene Donors</Text>
          </View>
        </Card>

        {/* Development Pillars Section */}
        <Text style={styles.sectionTitle}>Four Core Transformation Pillars</Text>
        <View style={styles.pillarsGrid}>
          {PILLARS.map((p, idx) => (
            <View key={idx} style={styles.pillarCard}>
              <View style={styles.pillarIconBox}>
                <Text style={{ fontSize: 24 }}>{p.icon}</Text>
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.pillarDesc}>{p.desc}</Text>
              <Text style={styles.pillarTarget}>{p.allocation}</Text>
            </View>
          ))}
        </View>

        {/* Donation Amount Selector */}
        <Card style={styles.donationFormCard}>
          <Text style={styles.formTitle}>Make a Direct Endowment Pledge</Text>
          <Text style={styles.formSubtitle}>Select a pledge tier or enter a custom amount in Naira:</Text>

          <View style={styles.tiersGrid}>
            {PRESETS.map((amt) => {
              const isSelected = selectedAmount === amt && !customAmount;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[styles.tierBtn, isSelected && styles.tierBtnSelected]}
                  onPress={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tierBtnText, isSelected && styles.tierBtnTextSelected]}>
                    ₦{amt.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>OR ENTER CUSTOM AMOUNT (₦)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 50000"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(v) => {
              setCustomAmount(v);
              setSelectedAmount(null);
            }}
          />

          <Text style={styles.inputLabel}>FULL NAME (FOR OFFICIAL RECOGNITION ROLL)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Engr. Babatunde Adeleke"
            placeholderTextColor="#94a3b8"
            value={donorName}
            onChangeText={setDonorName}
          />

          <TouchableOpacity style={styles.donateSubmitBtn} onPress={handleDonate} activeOpacity={0.85}>
            <Text style={styles.donateSubmitText}>
              Proceed with Secure Paystack Checkout ➔
            </Text>
          </TouchableOpacity>

          {/* Official Bank Account Details */}
          <View style={styles.bankBox}>
            <Text style={styles.bankBoxTitle}>🏛️ Direct Bank Transfer (Nigeria)</Text>
            <Text style={styles.bankDetail}>Account Name: <strong>Ogere Community Development Assoc.</strong></Text>
            <Text style={styles.bankDetail}>Bank: <strong>Wema Bank Plc</strong></Text>
            <Text style={styles.bankDetail}>Account Number: <strong>0123456789</strong></Text>
            <Text style={styles.bankNote}>Narration: [Your Full Name] - Ogere 2026 Fund</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 50,
  },
  countdownBanner: {
    backgroundColor: '#042f24',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9963a',
    marginBottom: 12,
  },
  countdownLabel: {
    color: '#c9963a',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeBox: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 54,
    borderWidth: 1,
    borderColor: 'rgba(201, 150, 58, 0.4)',
  },
  timeNum: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  timeUnit: {
    color: '#a7f3d0',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  timeColon: {
    color: '#c9963a',
    fontSize: 18,
    fontWeight: '900',
  },
  progressCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amountText: {
    color: '#064e3b',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  percentText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 6,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerNote: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  pillarsGrid: {
    gap: 8,
    marginBottom: 16,
  },
  pillarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  pillarDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  pillarTarget: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginTop: 6,
  },
  donationFormCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  tiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tierBtn: {
    flexBasis: '31%',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tierBtnSelected: {
    backgroundColor: '#064e3b',
    borderColor: '#c9963a',
  },
  tierBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  tierBtnTextSelected: {
    color: '#ffffff',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 12,
  },
  donateSubmitBtn: {
    backgroundColor: '#064e3b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  donateSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  bankBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  bankBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  bankDetail: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 18,
  },
  bankNote: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
});
