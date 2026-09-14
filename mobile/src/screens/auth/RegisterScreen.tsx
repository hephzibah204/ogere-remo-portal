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
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { useAuth } from '../../services/authContext';

type CitizenCategory = 'indigene' | 'non-indigene' | 'guest';
type IndigeneResidency = 'ogere' | 'diaspora' | 'nigeria';

interface CategoryOption {
  id: CitizenCategory;
  title: string;
  badge: string;
  icon: string;
  description: string;
}

const CITIZEN_CATEGORIES: CategoryOption[] = [
  {
    id: 'indigene',
    title: 'Indigene',
    badge: 'Ancestral Lineage',
    icon: '👑',
    description: 'Born of Ogere Remo parentage or ancestral compound (Agbo-Ile).',
  },
  {
    id: 'non-indigene',
    title: 'Non-Indigene Resident',
    badge: 'Lives / Works in Ogere',
    icon: '🏢',
    description: 'Living, trading, or working in Ogere Remo, but ancestry from elsewhere.',
  },
  {
    id: 'guest',
    title: 'Guest / Friend of Ogere',
    badge: 'External Partner',
    icon: '🤝',
    description: 'Has interest or a role in Ogere, but is not an indigene and does not live or work in Ogere.',
  },
];

const INDIGENE_RESIDENCIES = [
  { id: 'ogere' as IndigeneResidency, label: '🏡 Resident in Ogere', sub: 'Living within Ogere Remo' },
  { id: 'diaspora' as IndigeneResidency, label: '✈️ In Diaspora', sub: 'Living abroad internationally' },
  { id: 'nigeria' as IndigeneResidency, label: '🇳🇬 In Nigeria', sub: 'Living in another Nigerian town/city' },
];

const GUEST_INTERESTS = [
  'Investor / Commercial Partner',
  'Cultural Enthusiast / Researcher',
  'Palace Ally / Philanthropist',
  'Tourist / Frequent Visitor',
  'Civic Ally & Well-Wisher',
];

const QUARTERS = ['Oke-Ogere', 'Isale-Ogere', 'Agbele', 'Ajura Corridor', 'Expressway Axis', 'Other'];

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Primary Category Selection
  const [citizenType, setCitizenType] = useState<CitizenCategory>('indigene');

  // Indigene-Specific Location Fields
  const [indigeneResidency, setIndigeneResidency] = useState<IndigeneResidency>('ogere');
  const [quarter, setQuarter] = useState('Oke-Ogere');
  const [compound, setCompound] = useState('');
  const [diasporaCountry, setDiasporaCountry] = useState('');
  const [diasporaCity, setDiasporaCity] = useState('');
  const [nigeriaState, setNigeriaState] = useState('');
  const [nigeriaCity, setNigeriaCity] = useState('');

  // Non-Indigene Fields
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');

  // Guest Fields
  const [guestInterest, setGuestInterest] = useState(GUEST_INTERESTS[0]);
  const [guestLocation, setGuestLocation] = useState('');
  const [organization, setOrganization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic preview prefix
  const getPreviewPrefix = () => {
    if (citizenType === 'indigene') {
      if (indigeneResidency === 'diaspora') return 'OGR-IND-INT';
      if (indigeneResidency === 'nigeria') return 'OGR-IND-NG';
      return 'OGR-IND-OG';
    }
    if (citizenType === 'non-indigene') return 'OGR-RES';
    return 'OGR-GST';
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Please provide at least an email address or phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validation per category
    if (citizenType === 'indigene') {
      if (!compound.trim()) {
        setError('Please enter your ancestral family compound (Agbo-Ile) in Ogere.');
        return;
      }
      if (indigeneResidency === 'diaspora' && !diasporaCountry.trim()) {
        setError('Please specify the country where you currently reside in diaspora.');
        return;
      }
      if (indigeneResidency === 'nigeria' && (!nigeriaState.trim() || !nigeriaCity.trim())) {
        setError('Please specify the Nigerian state and town/city where you currently live.');
        return;
      }
    } else if (citizenType === 'non-indigene') {
      if (!address.trim()) {
        setError('Please enter your residential or business street address in Ogere Remo.');
        return;
      }
    } else if (citizenType === 'guest') {
      if (!guestLocation.trim()) {
        setError('Please specify your current city and country of residence.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    const res = await signUp({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      password,
      citizenType,
      indigeneResidency: citizenType === 'indigene' ? indigeneResidency : undefined,
      quarter: citizenType === 'guest' ? 'External / Guest' : quarter,
      compound: compound.trim(),
      diasporaCountry: diasporaCountry.trim(),
      diasporaCity: diasporaCity.trim(),
      nigeriaState: nigeriaState.trim(),
      nigeriaCity: nigeriaCity.trim(),
      address: address.trim(),
      occupation: occupation.trim(),
      guestInterest: citizenType === 'guest' ? guestInterest : undefined,
      cityCountry: guestLocation.trim(),
      organization: organization.trim(),
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Civic Registration</Text>
            <Text style={styles.subtitle}>
              Register for your official certified Ogere Remo Digital ID Card.
            </Text>
          </View>

          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 1. SELECT PRIMARY CIVIC CATEGORY */}
            <View style={styles.field}>
              <Text style={styles.sectionLabel}>1. Select Your Civic Category *</Text>
              <Text style={styles.helperText}>
                Identify your connection to Ogere Remo Kingdom.
              </Text>

              <View style={styles.categoryCardsList}>
                {CITIZEN_CATEGORIES.map(cat => {
                  const isSelected = citizenType === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCitizenType(cat.id)}
                      style={[
                        styles.catOptionCard,
                        isSelected && styles.catOptionCardActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.catOptionHeader}>
                        <View style={styles.catOptionIcon}>
                          <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.catTitleRow}>
                            <Text
                              style={[
                                styles.catOptionTitle,
                                isSelected && styles.catOptionTitleActive,
                              ]}
                            >
                              {cat.title}
                            </Text>
                            <View
                              style={[
                                styles.catBadge,
                                isSelected && styles.catBadgeActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.catBadgeText,
                                  isSelected && styles.catBadgeTextActive,
                                ]}
                              >
                                {cat.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.catOptionDesc}>{cat.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* DIGITAL ID CARD LIVE BADGE PREVIEW */}
            <View style={styles.idPreviewBanner}>
              <View style={styles.idPreviewHeader}>
                <Text style={styles.idPreviewEmoji}>🪪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.idPreviewTitle}>
                    Automated Digital ID Card Issuance
                  </Text>
                  <Text style={styles.idPreviewText}>
                    Assigned Prefix: <Text style={{ fontWeight: '800' }}>{getPreviewPrefix()}-XXXXXX</Text> · Valid for 3 Years
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. CATEGORY-SPECIFIC LOCATION SECTIONS */}

            {/* === INDIGENE SECTION === */}
            {citizenType === 'indigene' && (
              <View style={styles.subCategoryBox}>
                <Text style={styles.subSectionTitle}>Indigene Residency Status *</Text>
                <Text style={styles.helperText}>
                  Where do you currently reside?
                </Text>

                <View style={styles.residencyPillsRow}>
                  {INDIGENE_RESIDENCIES.map(r => (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setIndigeneResidency(r.id)}
                      style={[
                        styles.residencyPill,
                        indigeneResidency === r.id && styles.residencyPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.residencyPillText,
                          indigeneResidency === r.id && styles.residencyPillTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sub-case A: Diaspora International */}
                {indigeneResidency === 'diaspora' && (
                  <View style={styles.locationFieldsBlock}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Country in Diaspora *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. United Kingdom, United States, Canada, Germany"
                        placeholderTextColor={Colors.textMuted}
                        value={diasporaCountry}
                        onChangeText={setDiasporaCountry}
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.label}>City of Residence in Diaspora</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. London, Houston, Toronto, Berlin"
                        placeholderTextColor={Colors.textMuted}
                        value={diasporaCity}
                        onChangeText={setDiasporaCity}
                      />
                    </View>
                  </View>
                )}

                {/* Sub-case B: In Nigeria outside Ogere */}
                {indigeneResidency === 'nigeria' && (
                  <View style={styles.locationFieldsBlock}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Current State in Nigeria *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Lagos, Oyo, FCT Abuja, Rivers, Edo"
                        placeholderTextColor={Colors.textMuted}
                        value={nigeriaState}
                        onChangeText={setNigeriaState}
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.label}>Current Town / City in Nigeria *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Ikeja, Lekki, Ibadan, Port Harcourt, Abeokuta"
                        placeholderTextColor={Colors.textMuted}
                        value={nigeriaCity}
                        onChangeText={setNigeriaCity}
                      />
                    </View>
                  </View>
                )}

                {/* Shared Indigene Heritage Fields */}
                <View style={styles.field}>
                  <Text style={styles.label}>Ancestral Quarter in Ogere *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quarterScroll}>
                    {QUARTERS.map(q => (
                      <TouchableOpacity
                        key={q}
                        onPress={() => setQuarter(q)}
                        style={[
                          styles.quarterChip,
                          quarter === q && styles.quarterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quarterText,
                            quarter === q && styles.quarterTextActive,
                          ]}
                        >
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Ancestral Family Compound / Agbo-Ile *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Kankanbina, Ejigboye, Olipakala, Legunsen, Oregunsen"
                    placeholderTextColor={Colors.textMuted}
                    value={compound}
                    onChangeText={setCompound}
                  />
                </View>
              </View>
            )}

            {/* === NON-INDIGENE RESIDENT SECTION === */}
            {citizenType === 'non-indigene' && (
              <View style={styles.subCategoryBox}>
                <Text style={styles.subSectionTitle}>Resident in Ogere Details *</Text>
                <Text style={styles.helperText}>
                  For residents and workers residing or trading within Ogere Remo.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Residential Quarter in Ogere *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quarterScroll}>
                    {QUARTERS.map(q => (
                      <TouchableOpacity
                        key={q}
                        onPress={() => setQuarter(q)}
                        style={[
                          styles.quarterChip,
                          quarter === q && styles.quarterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quarterText,
                            quarter === q && styles.quarterTextActive,
                          ]}
                        >
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Street / Residential Address in Ogere *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Plot 5 Expressway Corridor, Palace Way Axis"
                    placeholderTextColor={Colors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Occupation / Enterprise in Ogere</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Logistics Director, Civil Engineer, Merchant"
                    placeholderTextColor={Colors.textMuted}
                    value={occupation}
                    onChangeText={setOccupation}
                  />
                </View>
              </View>
            )}

            {/* === GUEST / FRIEND OF OGERE SECTION === */}
            {citizenType === 'guest' && (
              <View style={styles.subCategoryBox}>
                <Text style={styles.subSectionTitle}>Guest & Stakeholder Affiliation *</Text>
                <Text style={styles.helperText}>
                  You do not live or work in Ogere, but have an active interest or partnership with the community.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Nature of Interest / Affiliation with Ogere *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quarterScroll}>
                    {GUEST_INTERESTS.map(item => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => setGuestInterest(item)}
                        style={[
                          styles.quarterChip,
                          guestInterest === item && styles.quarterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quarterText,
                            guestInterest === item && styles.quarterTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Where are you currently located? (City & Country) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Victoria Island, Lagos or New York, USA"
                    placeholderTextColor={Colors.textMuted}
                    value={guestLocation}
                    onChangeText={setGuestLocation}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Organization / Profession (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. UNESCO Cultural Desk, Private Enterprise, University"
                    placeholderTextColor={Colors.textMuted}
                    value={organization}
                    onChangeText={setOrganization}
                  />
                </View>
              </View>
            )}

            {/* 3. GENERAL CITIZEN DETAILS */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Legal Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Dr. Babatunde Ogunleke"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number (Call or WhatsApp) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 08034512345 or +44 7911 123456"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. citizen@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Create Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button
              title="Submit & Generate Digital ID Card"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
              style={{ marginTop: 8 }}
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  backBtn: {
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  backBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  categoryCardsList: {
    gap: 8,
  },
  catOptionCard: {
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    padding: 12,
    backgroundColor: Colors.surfaceSubtle,
  },
  catOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  catOptionHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  catOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  catOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  catOptionTitleActive: {
    color: Colors.primary,
  },
  catBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeActive: {
    backgroundColor: Colors.primary,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catBadgeTextActive: {
    color: '#ffffff',
  },
  catOptionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  idPreviewBanner: {
    backgroundColor: '#064e3b',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  idPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  idPreviewEmoji: {
    fontSize: 24,
  },
  idPreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  idPreviewText: {
    fontSize: 11,
    color: '#a7f3d0',
    marginTop: 2,
  },
  subCategoryBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    padding: 12,
    gap: 12,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  residencyPillsRow: {
    gap: 6,
  },
  residencyPill: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.sm,
  },
  residencyPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  residencyPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  residencyPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  locationFieldsBlock: {
    gap: 10,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  quarterScroll: {
    flexDirection: 'row',
  },
  quarterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  quarterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  quarterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quarterTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
