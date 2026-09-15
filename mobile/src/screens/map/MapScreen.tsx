import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Shadows } from '../../theme';

interface Landmark {
  id: string;
  name: string;
  category: 'safety' | 'health' | 'royal' | 'logistics' | 'education' | 'market';
  categoryLabel: string;
  icon: string;
  coords: { lat: number; lng: number };
  address: string;
  desc: string;
  emergencySector: string;
  phone?: string;
}

const OGERE_LANDMARKS: Landmark[] = [
  {
    id: 'lm_palace',
    name: 'Palace of the Ologere (Aafin)',
    category: 'royal',
    categoryLabel: 'Royal & Heritage',
    icon: '👑',
    coords: { lat: 6.9233, lng: 3.5827 },
    address: 'Palace Square, Oke-Ogere, Ogere Remo',
    desc: 'Ancient seat of HRM Oba James Obafemi Saliu (Kankanbiina II), Council of Chiefs, and Royal Peace Tribunal.',
    emergencySector: 'Palace Square / Oke-Ogere Sector',
    phone: '08023456789',
  },
  {
    id: 'lm_police',
    name: 'Nigeria Police Divisional Station',
    category: 'safety',
    categoryLabel: 'Security & Rapid Response',
    icon: '👮‍♂️',
    coords: { lat: 6.9248, lng: 3.5841 },
    address: 'Palace Way, Ogere Remo',
    desc: '24/7 Police post, anti-kidnapping liaison, and joint vigilante night patrol command.',
    emergencySector: 'Palace Way / Police Sector',
    phone: '08034567890',
  },
  {
    id: 'lm_tollgate',
    name: 'KM 67 Tollgate Expressway Corridor',
    category: 'safety',
    categoryLabel: 'Highway Patrol & Safety',
    icon: '🚨',
    coords: { lat: 6.9388, lng: 3.6437 },
    address: 'KM 67 Lagos–Ibadan Expressway, Ogere Outpost',
    desc: 'FRSC Highway Patrol Base, accident extrication unit, and heavy haulage traffic corridor.',
    emergencySector: 'KM 67 Expressway Corridor',
    phone: '122',
  },
  {
    id: 'lm_trailer_park',
    name: 'Ogere Trailer Park & CNG Energy Depot',
    category: 'logistics',
    categoryLabel: 'Logistics & Commerce',
    icon: '🚛',
    coords: { lat: 6.9366, lng: 3.6344 },
    address: 'Expressway Bypass, South Gate, Ogere Remo',
    desc: 'Major interstate haulage transit depot, commercial diesel logistics, and TEG CNG natural gas filling plant.',
    emergencySector: 'Trailer Park / Bypass Sector',
  },
  {
    id: 'lm_health',
    name: 'Ogere Primary Health Centre',
    category: 'health',
    categoryLabel: 'Emergency Healthcare',
    icon: '🏥',
    coords: { lat: 6.9215, lng: 3.5812 },
    address: 'Isale-Ogere Hospital Road',
    desc: 'WHO-standard cold chain vaccine hub, 10kVA 24-hour solar maternity ward, and emergency trauma triage.',
    emergencySector: 'Isale-Ogere Health Sector',
    phone: '08123456781',
  },
  {
    id: 'lm_market',
    name: 'Oke-Ogere Central Market & Adire Hub',
    category: 'market',
    categoryLabel: 'Commerce & Culture',
    icon: '🛍️',
    coords: { lat: 6.9242, lng: 3.5835 },
    address: 'Oke-Ogere Market Square',
    desc: 'Traditional 4-day market, authentic Yoruba Adire indigo textiles, local farm harvest, and artisan stalls.',
    emergencySector: 'Oke-Ogere Market Sector',
  },
  {
    id: 'lm_agbele',
    name: 'Agbele Farmlands Escort Corridor',
    category: 'safety',
    categoryLabel: 'Virtual Escort Axis',
    icon: '🚶‍♂️',
    coords: { lat: 6.9189, lng: 3.5784 },
    address: 'Agbele Farm Road, Southern Ogere',
    desc: 'Agricultural corridor monitored by Walk With Me virtual escort and local community hunters patrol.',
    emergencySector: 'Agbele Farmlands Corridor',
  },
  {
    id: 'lm_school',
    name: 'Ogere Anglican Grammar School',
    category: 'education',
    categoryLabel: 'Education & Youth',
    icon: '🎓',
    coords: { lat: 6.9271, lng: 3.5862 },
    address: 'Anglican Road, Ogere Remo',
    desc: 'Historic educational institution established in 1965, serving generations of Remo scholars.',
    emergencySector: 'Anglican School Sector',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Places', emoji: '🗺️' },
  { id: 'safety', label: 'Security & Police', emoji: '🚨' },
  { id: 'health', label: 'Health & Clinic', emoji: '🏥' },
  { id: 'royal', label: 'Palace & Heritage', emoji: '👑' },
  { id: 'logistics', label: 'Commerce & Transit', emoji: '🚛' },
];

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLandmarks = OGERE_LANDMARKS.filter((lm) => {
    const matchesCat = selectedCategory === 'all' || lm.category === selectedCategory;
    const matchesSearch =
      lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.emergencySector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openInGoogleMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}+(${encodeURIComponent(label)})`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="TOWN MAP & SECTORS"
        subtitle="Digitized Landmarks & Rapid Emergency Zones"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {/* Town GPS Radar Card */}
      <View style={styles.gpsBanner}>
        <View style={styles.gpsIconCircle}>
          <Text style={{ fontSize: 24 }}>🛰️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.gpsTitle}>Ogere Remo Town Coordinates</Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>GPS ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.gpsSubtitle}>Lat: 6.9233° N · Long: 3.5827° E · Elevation: 88m</Text>
          <Text style={styles.gpsDistrict}>Ikenne Local Government Area, Ogun State, Nigeria</Text>
        </View>
      </View>

      {/* Category Pills Bar */}
      <View style={styles.catBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catBar}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, isSelected && styles.catPillSelected]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, marginRight: 4 }}>{cat.emoji}</Text>
                <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sectors, health centers, corridors..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Landmarks Cards List */}
      <ScrollView contentContainerStyle={styles.landmarksList}>
        {filteredLandmarks.map((lm) => (
          <Card key={lm.id} style={styles.landmarkCard}>
            <View style={styles.landmarkHeaderRow}>
              <View style={styles.landmarkIconBox}>
                <Text style={{ fontSize: 24 }}>{lm.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.sectorBadge}>
                  <Text style={styles.sectorBadgeText}>{lm.emergencySector.toUpperCase()}</Text>
                </View>
                <Text style={styles.landmarkName}>{lm.name}</Text>
                <Text style={styles.landmarkAddress}>{lm.address}</Text>
              </View>
            </View>

            <Text style={styles.landmarkDesc}>{lm.desc}</Text>

            {/* Action Buttons Row */}
            <View style={styles.landmarkActions}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => openInGoogleMaps(lm.coords.lat, lm.coords.lng, lm.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.navBtnText}>📍 Open in Google Maps</Text>
              </TouchableOpacity>

              {lm.phone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${lm.phone}`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callBtnText}>📞 Call {lm.phone}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.sosSectorBtn}
                onPress={() => navigation.navigate('IncidentReport')}
                activeOpacity={0.8}
              >
                <Text style={styles.sosSectorBtnText}>🚨 SOS in this Sector</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gpsBanner: {
    backgroundColor: '#064e3b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c9963a',
    gap: 12,
  },
  gpsIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#042f24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c9963a',
  },
  gpsTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  livePill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  livePillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  gpsSubtitle: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  gpsDistrict: {
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 1,
  },
  catBarWrapper: {
    marginTop: 10,
  },
  catBar: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catPillSelected: {
    backgroundColor: '#064e3b',
    borderColor: '#c9963a',
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 14,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
  },
  landmarksList: {
    padding: 14,
    gap: 12,
    paddingBottom: 40,
  },
  landmarkCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  landmarkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  landmarkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  sectorBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  landmarkName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  landmarkAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  landmarkDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 10,
  },
  landmarkActions: {
    marginTop: 12,
    gap: 6,
  },
  navBtn: {
    backgroundColor: '#064e3b',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  callBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  callBtnText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  sosSectorBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  sosSectorBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
});
