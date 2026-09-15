import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Shadows } from '../../theme';

interface MarketItem {
  id: string;
  title: string;
  seller: string;
  quarter: string;
  category: string;
  price: string;
  desc: string;
  phone: string;
  emoji: string;
  verified: boolean;
}

const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'm1',
    title: 'Authentic Ogere Adire Alabere Fabric (5 Yards)',
    seller: 'Iya Ni Wura Adire Emporium',
    quarter: 'Oke-Ogere Market Quarter',
    category: 'adire',
    price: '₦18,500',
    desc: 'Hand-dyed organic indigo cotton fabric patterned with historic Yoruba geometric motifs.',
    phone: '08023456789',
    emoji: '👘',
    verified: true,
  },
  {
    id: 'm2',
    title: 'Fresh Ogere White Garri (50kg Bag)',
    seller: 'Agbele Farmers Cooperative',
    quarter: 'Agbele Farmlands Axis',
    category: 'agric',
    price: '₦32,000',
    desc: 'Crisp, sand-free, traditionally fried cassava flakes from fertile Ogere soils.',
    phone: '08034567891',
    emoji: '🌾',
    verified: true,
  },
  {
    id: 'm3',
    title: 'Custom Beaded Walking Staff & Royal Caps',
    seller: 'Alagbe Crown Crafts',
    quarter: 'Isale-Ogere Artisan Quarter',
    category: 'crafts',
    price: '₦25,000',
    desc: 'Intricate royal beadwork handcrafted for chieftains, title holders, and cultural festivals.',
    phone: '08098765432',
    emoji: '👑',
    verified: true,
  },
  {
    id: 'm4',
    title: 'Cold-Pressed Palm Oil (25 Litres Keg)',
    seller: 'Remo Palm Oil Mills',
    quarter: 'Ogere Industrial Bypass',
    category: 'agric',
    price: '₦38,000',
    desc: 'Zero-adulteration, unrefined red palm oil harvested directly from Remo estates.',
    phone: '08123456789',
    emoji: '🌴',
    verified: true,
  },
  {
    id: 'm5',
    title: 'Solar Inverter & CCTV Installation Service',
    seller: 'Ogere Remo Green Tech Solutions',
    quarter: 'Expressway Gateway Axis',
    category: 'services',
    price: 'Custom Quote',
    desc: 'Certified engineers installing home/business solar backup and cloud IP cameras.',
    phone: '08055443322',
    emoji: '⚡',
    verified: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Listings' },
  { id: 'adire', label: 'Adire & Textiles' },
  { id: 'agric', label: 'Farm Produce' },
  { id: 'crafts', label: 'Arts & Heritage' },
  { id: 'services', label: 'Trade Services' },
];

export const MarketplaceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  const filteredItems = MARKET_ITEMS.filter((item) => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.toLowerCase().includes(search.toLowerCase()) ||
      item.quarter.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleWhatsApp = (phone: string, title: string) => {
    const cleanPhone = phone.replace(/^0/, '234');
    const msg = encodeURIComponent(`Hello! I saw your listing for "${title}" on the Ogere Remo Mobile App. Is it available?`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="LOCAL MARKETPLACE"
        subtitle="Adire Textiles, Farm Produce & Crafts"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {/* Category Pills Bar */}
      <View style={styles.catBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catBar}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, isSelected && styles.catPillSelected]}
                onPress={() => setSelectedCat(cat.id)}
                activeOpacity={0.7}
              >
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
          placeholder="Search Adire, Garri, artisans, sellers..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.itemsList}>
        {filteredItems.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.emojiBox}>
                <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.badgeRow}>
                  <Text style={styles.priceTag}>{item.price}</Text>
                  {item.verified && (
                    <View style={styles.verifiedPill}>
                      <Text style={styles.verifiedPillText}>✓ VERIFIED LOCAL SELLER</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.sellerName}>Sold by: {item.seller}</Text>
                <Text style={styles.quarterText}>📍 {item.quarter}</Text>
              </View>
            </View>

            <Text style={styles.itemDesc}>{item.desc}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.waBtn}
                onPress={() => handleWhatsApp(item.phone, item.title)}
                activeOpacity={0.8}
              >
                <Text style={styles.waBtnText}>💬 Order on WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.callBtnText}>📞 Call Seller</Text>
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
  catBarWrapper: {
    marginTop: 10,
  },
  catBar: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
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
  itemsList: {
    padding: 14,
    gap: 12,
    paddingBottom: 40,
  },
  itemCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064e3b',
  },
  verifiedPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPillText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  sellerName: {
    fontSize: 11,
    color: '#334155',
    marginTop: 2,
  },
  quarterText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  itemDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  waBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  callBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 9,
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
});
