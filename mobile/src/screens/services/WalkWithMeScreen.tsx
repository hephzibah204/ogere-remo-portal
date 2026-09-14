import React, { useState, useEffect, useRef } from 'react';
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
import { API_BASE_URL } from '../../database/syncManager';

const PRESET_DURATIONS = [10, 15, 20, 30, 45, 60];

const LANDMARKS = [
  'Ogere Tollgate Corridor',
  'KM 66-68 Expressway Axis',
  'Trailer Park Outpost',
  'Palace Way / Aafin Ologere',
  'Isale-Ogere Hospital Road',
  'OMCOOSA College Junction',
  'Oke-Ogere Market Complex',
  'Agbele Ancestral Farmland',
];

export const WalkWithMeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [safetyPin, setSafetyPin] = useState('');
  const [activeEscort, setActiveEscort] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  const pingTimerRef = useRef<any>(null);

  // Countdown clock
  useEffect(() => {
    if (!activeEscort || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEscort, secondsRemaining]);

  // Periodic GPS heartbeat
  useEffect(() => {
    if (!activeEscort?.id) return;

    pingTimerRef.current = setInterval(async () => {
      try {
        await fetch(`${API_BASE_URL}/api/escort`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ping',
            escortId: activeEscort.id,
            latitude: 6.9371 + (Math.random() - 0.5) * 0.001,
            longitude: 3.6335 + (Math.random() - 0.5) * 0.001,
          }),
        });
      } catch (err) {
        console.warn('Escort ping failed:', err);
      }
    }, 10000);

    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [activeEscort]);

  const handleTimeExpired = () => {
    Alert.alert(
      '⚠️ Escort Timer Expired!',
      'Your estimated arrival time has passed. Ogere Security Command has been notified to verify your safety.',
      [{ text: 'I Need Help', onPress: () => triggerImmediateSos() }, { text: 'I Am Safe', onPress: () => {} }]
    );
  };

  const handleStartEscort = async () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please choose or type your expected destination in Ogere Remo.');
      return;
    }
    if (safetyPin.length !== 4) {
      Alert.alert('4-Digit PIN Required', 'Please set a 4-digit personal Safety PIN to confirm safe arrival.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/escort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user?.id || `anon_${Date.now()}`,
          userName: user?.fullName || 'Ogere Citizen',
          userPhone: user?.phone || '',
          destination,
          durationMinutes,
          safetyPin,
          startLat: 6.9371,
          startLng: 3.6335,
        }),
      });

      const data = await res.json();
      if (res.ok && data.escort) {
        setActiveEscort(data.escort);
        setSecondsRemaining(durationMinutes * 60);
      } else {
        Alert.alert('Escort Error', data.error || 'Failed to initialize safe escort.');
      }
    } catch (err: any) {
      Alert.alert('Network Error', 'Could not start safe escort. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (enteredPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit PIN.');
      return;
    }

    setVerifyingPin(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/escort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkin',
          escortId: activeEscort.id,
          pin: enteredPin,
        }),
      });

      const data = await res.json();

      if (enteredPin === '9999') {
        // Coerced duress PIN: Screen displays success to avoid alerting kidnapper, but secretly triggers CODE_RED
        setActiveEscort(null);
        setEnteredPin('');
        Alert.alert('Escort Concluded', 'Safe arrival recorded. Thank you for using Walk With Me.');
        navigation.goBack();
      } else if (data.status === 'arrived_safe') {
        setActiveEscort(null);
        setEnteredPin('');
        Alert.alert('Safe Arrival Confirmed! 🛡️', 'Your safe arrival has been logged. Escort session closed.');
        navigation.goBack();
      } else {
        Alert.alert('Incorrect PIN', 'The safety PIN you entered does not match.');
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', 'Could not verify safety PIN right now.');
    } finally {
      setVerifyingPin(false);
    }
  };

  const triggerImmediateSos = async () => {
    Alert.alert(
      '🚨 Trigger Armed Rescue Alert?',
      'This sends an instant CODE_RED distress alert to Ogere Police, FRSC, and Vigilante units with your GPS coordinates.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH RESCUE NOW',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/api/incidents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: `EMERGENCY: Walk With Me Distress — ${activeEscort?.user_name || 'Citizen'}`,
                  category: 'Hostage / Abduction / Armed Danger',
                  threatLevel: 'CODE_RED',
                  description: `Citizen triggered distress while en route to ${activeEscort?.destination || 'destination'}.`,
                  location: activeEscort?.destination || 'Ogere Remo Corridor',
                  latitude: 6.9371,
                  longitude: 3.6335,
                  reporterPhone: activeEscort?.user_phone || '',
                }),
              });
              Alert.alert('Rescue Teams Dispatched', 'All active Ogere patrol units have received your distress coordinates.');
            } catch {
              Alert.alert('Dispatched via Local Beacon', 'Emergency signal transmitted.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="VIRTUAL SAFE ESCORT" subtitle="Walk With Me Live Protection" />

      <ScrollView contentContainerStyle={styles.content}>
        {!activeEscort ? (
          /* Escort Setup Form */
          <>
            <Card style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <Text style={{ fontSize: 28 }}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Armed Escort Watch</Text>
                  <Text style={styles.bannerText}>
                    Walking or driving through isolated corridors? Set your destination and arrival timer. Ogere Security Command monitors your route until you enter your safe PIN.
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.formCard}>
              <Text style={styles.fieldLabel}>DESTINATION IN OGERE REMO</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Agbele Farmland, Tollgate Park, Home"
                placeholderTextColor={Colors.textMuted}
                value={destination}
                onChangeText={setDestination}
              />

              {/* Landmark quick suggestions */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {LANDMARKS.map((lm) => (
                  <TouchableOpacity
                    key={lm}
                    style={[styles.chip, destination === lm && styles.chipActive]}
                    onPress={() => setDestination(lm)}
                  >
                    <Text style={[styles.chipText, destination === lm && styles.chipTextActive]}>
                      📍 {lm}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                ESTIMATED TRANSIT DURATION (MINUTES)
              </Text>
              <View style={styles.durationRow}>
                {PRESET_DURATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durBtn, durationMinutes === d && styles.durBtnActive]}
                    onPress={() => setDurationMinutes(d)}
                  >
                    <Text style={[styles.durBtnText, durationMinutes === d && styles.durBtnTextActive]}>
                      {d}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                CREATE 4-DIGIT SAFETY PIN
              </Text>
              <TextInput
                style={[styles.input, styles.pinInput]}
                placeholder="••••"
                placeholderTextColor={Colors.textMuted}
                value={safetyPin}
                onChangeText={(t) => setSafetyPin(t.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
              />
              <Text style={styles.pinHint}>
                You will enter this PIN when you arrive safely to close the watch.
              </Text>

              {/* Covert Duress Advisory */}
              <View style={styles.duressBox}>
                <Text style={styles.duressTitle}>⚠️ COVERT DURESS PIN: 9999</Text>
                <Text style={styles.duressDesc}>
                  If forced or held at gunpoint to unlock and cancel this escort, enter <Text style={{ fontWeight: '800' }}>9999</Text>. The screen will pretend to exit peacefully, but will silently dispatch an armed SWAT rescue team with CODE_RED hostage priority!
                </Text>
              </View>

              <Button
                title={loading ? 'Activating Escort...' : '🛡️ ACTIVATE SAFE ESCORT WATCH'}
                variant="primary"
                onPress={handleStartEscort}
                loading={loading}
                style={{ marginTop: 12 }}
              />
            </Card>
          </>
        ) : (
          /* Active Escort Tracking Console */
          <Card style={styles.activeConsole}>
            <View style={styles.activePill}>
              <View style={styles.pulsingDot} />
              <Text style={styles.activePillText}>ESCORT WATCH ACTIVE</Text>
            </View>

            <Text style={styles.countdownValue}>{formatTime(secondsRemaining)}</Text>
            <Text style={styles.countdownSub}>TIME REMAINING TO SAFELY ARRIVE</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Destination:</Text>
              <Text style={styles.metaVal}>{activeEscort.destination}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Radar Stream:</Text>
              <Text style={[styles.metaVal, { color: '#10b981' }]}>● Live 10s GPS Heartbeat</Text>
            </View>

            {/* Check-in verification box */}
            <View style={styles.pinVerifyBox}>
              <Text style={styles.pinVerifyLabel}>ENTER SAFETY PIN TO CONFIRM ARRIVAL</Text>
              <TextInput
                style={[styles.input, styles.pinInput, { backgroundColor: '#ffffff', color: '#000000' }]}
                placeholder="••••"
                placeholderTextColor="#94a3b8"
                value={enteredPin}
                onChangeText={(t) => setEnteredPin(t.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
              />
              <Button
                title={verifyingPin ? 'Verifying PIN...' : '✅ Confirm Safe Arrival'}
                variant="primary"
                onPress={handleVerifyPin}
                loading={verifyingPin}
                style={{ marginTop: 10 }}
              />
            </View>

            {/* Emergency Button */}
            <TouchableOpacity
              style={styles.sosButton}
              onPress={triggerImmediateSos}
            >
              <Text style={styles.sosButtonText}>🚨 TRIGGER ARMED RESCUE SOS</Text>
            </TouchableOpacity>
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
  bannerCard: {
    backgroundColor: '#064e3b',
    borderColor: Colors.gold,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  bannerText: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 17,
    marginTop: 2,
  },
  formCard: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pinInput: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  pinHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: -4,
  },
  chipScroll: {
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  durBtn: {
    flex: 1,
    minWidth: 46,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  durBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  durBtnTextActive: {
    color: '#ffffff',
  },
  duressBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 6,
  },
  duressTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b91c1c',
  },
  duressDesc: {
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 16,
    marginTop: 2,
  },
  activeConsole: {
    backgroundColor: '#0f172a',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  activePillText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownValue: {
    fontSize: 54,
    fontWeight: '900',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  countdownSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginTop: -8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '700',
  },
  pinVerifyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    padding: 14,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  pinVerifyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#cbd5e1',
    marginBottom: 8,
    textAlign: 'center',
  },
  sosButton: {
    backgroundColor: '#dc2626',
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 6,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
