import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import {
  getLocalEmergency,
  getLocalBusinesses,
  SeedEmergencyContact,
  SeedBusinessItem,
} from '../../database/sqlite';

const TABS = ['🚨 Emergency & Rescue', '🛡️ Safety Bulletins', '🏢 Business Directory'];

const EXPANDED_EMERGENCY = [
  {
    id: 'em-frsc',
    service: 'FRSC Expressway Highway Patrol & Rescue',
    phone: '122',
    location: 'KM 66 Lagos–Ibadan Expressway, Ogere Outpost',
    availableHours: '24/7 National Emergency Hotline',
    icon: '🚑',
    priority: 'HIGHWAY CRASH / RESCUE',
  },
  {
    id: 'em-police',
    service: 'Nigeria Police Divisional Headquarters Ogere',
    phone: '08034567890',
    location: 'Palace Way, Ogere Remo',
    availableHours: '24/7 Rapid Crime & Security Response',
    icon: '🚓',
    priority: 'SECURITY / CRIME',
  },
  {
    id: 'em-hospital',
    service: 'Ogere Comprehensive Primary Health Hospital',
    phone: '08123456781',
    location: 'Isale-Ogere Hospital Road',
    availableHours: '24 Hours Emergency Ward & Ambulance',
    icon: '🏥',
    priority: 'MEDICAL / TRAUMA',
  },
  {
    id: 'em-fire',
    service: 'Ogun State Fire & Industrial Safety Service',
    phone: '112',
    location: 'Sagamu / Ogere Corridor Station',
    availableHours: '24/7 Chemical & Fire Response',
    icon: '🚒',
    priority: 'FIRE / TANKER SPILL',
  },
  {
    id: 'em-palace',
    service: 'Palace of the Ologere Security Desk & Vigilante',
    phone: '08023456789',
    location: 'Aafin Ologere Council Secretariat',
    availableHours: '24/7 Community Peace & Vigilante',
    icon: '🛡️',
    priority: 'COMMUNITY WATCH',
  },
];

const SECURITY_BULLETINS = [
  {
    id: 'sb-1',
    severity: 'URGENT HAZARD',
    title: 'Expressway Diversion Notice: KM 67 Inbound Lagos Axis',
    date: 'Active Security Advisory',
    content: 'FRSC personnel are actively managing a commercial truck breakdown near the Ogere trailer park corridor. Motorists are advised to maintain 40 km/h and observe lane cones.',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    id: 'sb-2',
    severity: 'SAFETY NOTICE',
    title: 'CNG Pipeline Corridor Safety Protocol Reminder',
    date: 'Industrial Safety Desk',
    content: 'In accordance with community safety guidelines, open bonfires and cell phone usage within 50 meters of the TEG gas loading perimeter are strictly prohibited.',
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    id: 'sb-3',
    severity: 'COMMUNITY ALERT',
    title: 'Night Security Patrol Active in Oke-Ogere & Isale-Ogere',
    date: 'Palace Vigilante Council',
    content: 'Joint neighborhood patrols by the Ogere Central Council Vigilante Corps and Police Command remain active between 10:00 PM and 5:00 AM. Report suspicious movements to 08023456789.',
    color: '#059669',
    bg: '#ecfdf5',
  },
];

const FIRST_AID_GUIDES = [
  {
    title: 'Highway Crash & Severe Bleeding (Arterial Hemorrhage)',
    steps: [
      '1. Ensure personal safety before approaching the roadway.',
      '2. Apply firm, direct pressure with a clean cloth or garment directly on the wound.',
      '3. Elevate injured limbs above heart level if no fracture is suspected.',
      '4. Do NOT remove embedded objects (stabilize them with bulky cloth).',
      '5. Call FRSC (122) immediately for medical extraction.',
    ],
  },
  {
    title: 'Tanker Fuel Spill or Gas Leak Evacuation',
    steps: [
      '1. Move immediately UPWIND and at least 300 meters away from the source.',
      '2. Do NOT ignite engines, switch headlights, or create friction sparks.',
      '3. Warn bystanders not to approach to scoop spilled liquids.',
      '4. Call Fire Service (112) and Police (08034567890).',
    ],
  },
  {
    title: 'Adult CPR (Cardiopulmonary Resuscitation)',
    steps: [
      '1. Check responsiveness and shout for emergency assistance.',
      '2. Place hands centered on the chest (heel of hand on lower breastbone).',
      '3. Push hard and fast (100–120 compressions per minute, 2 inches deep).',
      '4. Maintain continuous compressions until professional paramedics arrive.',
    ],
  },
];

export const DirectoryScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [businesses, setBusinesses] = useState<SeedBusinessItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const biz = await getLocalBusinesses();
    setBusinesses(biz);
  };

  const handleCall = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Unable to Dial', `Please call: ${phone}`);
    });
  };

  const filteredBusinesses = businesses.filter(b =>
    !search.trim() ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="SECURITY & EMERGENCY" subtitle="First Responders & Directory Hub" />
      <OfflineNotice />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.split(' ')[1] || tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TAB 1: EMERGENCY & RESCUE */}
        {activeTab === TABS[0] && (
          <View style={styles.sectionGap}>
            <View style={styles.sosBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sosBannerTitle}>🚨 Emergency Rapid Dispatch</Text>
                <Text style={styles.sosBannerDesc}>
                  Direct 24/7 phone lines connected to Ogere Remo corridor first responders.
                </Text>
              </View>
            </View>

            <View style={styles.emergencyList}>
              {EXPANDED_EMERGENCY.map(item => (
                <Card key={item.id} style={styles.emergencyCard}>
                  <View style={styles.emTop}>
                    <View style={styles.emIconCircle}>
                      <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityBadgeText}>{item.priority}</Text>
                      </View>
                      <Text style={styles.emService}>{item.service}</Text>
                      <Text style={styles.emLocation}>📍 {item.location}</Text>
                      <Text style={styles.emHours}>🕒 {item.availableHours}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleCall(item.phone)}
                    style={styles.callBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.callBtnText}>⚡ SPEED DIAL: {item.phone}</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>

            {/* Offline First-Aid & Emergency Procedures */}
            <View style={{ marginTop: Spacing.md }}>
              <Text style={styles.subHeading}>📖 Offline Emergency First-Aid Guides</Text>
              <Text style={styles.subSubtitle}>
                Crucial survival protocols cached locally for instant access anytime.
              </Text>

              <View style={styles.guidesList}>
                {FIRST_AID_GUIDES.map((guide, idx) => (
                  <Card key={idx} style={styles.guideCard}>
                    <Text style={styles.guideTitle}>⚠️ {guide.title}</Text>
                    {guide.steps.map((step, sIdx) => (
                      <Text key={sIdx} style={styles.guideStep}>{step}</Text>
                    ))}
                  </Card>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: SAFETY ADVISORIES */}
        {activeTab === TABS[1] && (
          <View style={styles.sectionGap}>
            <Text style={styles.subHeading}>🛡️ Active Security & Traffic Bulletins</Text>
            <Text style={styles.subSubtitle}>
              Official community safety alerts issued by the Palace and FRSC Outpost.
            </Text>

            {SECURITY_BULLETINS.map(bulletin => (
              <Card
                key={bulletin.id}
                style={[styles.bulletinCard, { backgroundColor: bulletin.bg, borderColor: bulletin.color }]}
              >
                <View style={styles.bulletinHeader}>
                  <View style={[styles.bulletinPill, { backgroundColor: bulletin.color }]}>
                    <Text style={styles.bulletinPillText}>{bulletin.severity}</Text>
                  </View>
                  <Text style={styles.bulletinDate}>{bulletin.date}</Text>
                </View>
                <Text style={styles.bulletinTitle}>{bulletin.title}</Text>
                <Text style={styles.bulletinContent}>{bulletin.content}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 3: BUSINESS DIRECTORY */}
        {activeTab === TABS[2] && (
          <View style={styles.sectionGap}>
            <Text style={styles.subHeading}>🏢 Verified Community Businesses</Text>
            <Text style={styles.subSubtitle}>
              Local commerce, logistics, tech hubs, and services in Ogere Remo.
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search businesses or category..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />

            <View style={styles.bizList}>
              {filteredBusinesses.map(biz => (
                <Card key={biz.id} style={styles.bizCard}>
                  <View style={styles.bizHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tierBadgeRow}>
                        <Text style={styles.bizCategory}>{biz.category}</Text>
                        <View style={styles.tierBadge}>
                          <Text style={styles.tierText}>{biz.tier}</Text>
                        </View>
                        <Text style={styles.ratingText}>{biz.rating}</Text>
                      </View>
                      <Text style={styles.bizName}>{biz.name}</Text>
                    </View>
                  </View>

                  <Text style={styles.bizDesc}>{biz.description}</Text>
                  <Text style={styles.bizAddress}>📍 {biz.address}</Text>

                  <View style={styles.bizActions}>
                    <TouchableOpacity
                      onPress={() => handleCall(biz.phone)}
                      style={styles.contactBtn}
                    >
                      <Text style={styles.contactBtnText}>Call: {biz.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#dc2626',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#dc2626',
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionGap: {
    gap: 14,
  },
  sosBanner: {
    backgroundColor: '#991b1b',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.elevated,
  },
  sosBannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  sosBannerDesc: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  emergencyList: {
    gap: 12,
  },
  emergencyCard: {
    borderColor: '#fecaca',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  emTop: {
    flexDirection: 'row',
    gap: 12,
  },
  emIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#991b1b',
    letterSpacing: 0.5,
  },
  emService: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  emLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  emHours: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  guidesList: {
    gap: 10,
  },
  guideCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    gap: 6,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 2,
  },
  guideStep: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
  bulletinCard: {
    borderWidth: 1.5,
    gap: 8,
  },
  bulletinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulletinPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  bulletinPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  bulletinDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bulletinTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bulletinContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bizList: {
    gap: 12,
  },
  bizCard: {
    gap: 8,
  },
  bizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bizCategory: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  tierBadge: {
    backgroundColor: Colors.goldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
    marginLeft: 'auto',
  },
  bizName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bizDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bizAddress: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  bizActions: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  contactBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  contactBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
