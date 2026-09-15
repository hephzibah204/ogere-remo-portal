import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  desc: string;
  category: 'royalty' | 'cultural' | 'civic' | 'youth';
  status: 'upcoming' | 'completed';
}

const SEED_EVENTS: CommunityEvent[] = [
  {
    id: 'EVT-01',
    title: 'Grand Olipakala Cultural Festival & Masquerade Pageant',
    date: '2026-11-04',
    time: '09:00 AM WAT',
    venue: 'Ogere Town Hall Grounds & Aafin Ologere Esplanade',
    desc: 'The annual cultural pinnacle of Ogere Remo land. Features traditional rites, age-grade displays, cultural dances, royal blessings by Oba James Obafemi Saliu, and diaspora homecoming.',
    category: 'cultural',
    status: 'upcoming',
  },
  {
    id: 'EVT-02',
    title: '3rd Royal Coronation Anniversary Thanksgiving & Awards',
    date: '2026-04-18',
    time: '11:00 AM WAT',
    venue: 'Inner Royal Council Chamber, Aafin Ologere',
    desc: 'Celebration of royal ascension, chieftaincy conferments on distinguished indigenes, and presentation of the Kabiyesi Royal Merit Medals.',
    category: 'royalty',
    status: 'upcoming',
  },
  {
    id: 'EVT-03',
    title: 'OCDA Quarterly Civic Town Hall & Electrification Review',
    date: '2026-10-14',
    time: '02:00 PM WAT',
    venue: 'Civic Centre Hall, Oke-Ogere',
    desc: 'Community-wide deliberative session on solar mini-grid installations, road repairs along Sagamu corridor, and ₦10M Transformation Fund allocation.',
    category: 'civic',
    status: 'upcoming',
  },
  {
    id: 'EVT-04',
    title: 'Free Annual Diaspora Medical & Surgical Outreach',
    date: '2026-10-28',
    time: '08:30 AM WAT',
    venue: 'Ogere Comprehensive Primary Health Centre',
    desc: 'Free eye screenings, cataract surgeries, hypertension medication distribution, and general consultations powered by Ogere Diaspora Physicians UK/USA.',
    category: 'civic',
    status: 'upcoming',
  },
  {
    id: 'EVT-05',
    title: 'Miss Olipakala Heritage & Empowerment Pageant Finale',
    date: '2026-11-03',
    time: '06:00 PM WAT',
    venue: 'Royal Palace Marquee Event Centre',
    desc: 'Youth intellectual & cultural pageant showcasing Yoruba language fluency, traditional attires, and community development manifestos.',
    category: 'youth',
    status: 'upcoming',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: '🌟' },
  { id: 'cultural', label: 'Cultural & Olipakala', icon: '🎭' },
  { id: 'royalty', label: 'Palace & Royalty', icon: '👑' },
  { id: 'civic', label: 'Civic & Town Hall', icon: '🏛️' },
  { id: 'youth', label: 'Youth & Pageants', icon: '⚡' },
];

export const EventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [events, setEvents] = useState<CommunityEvent[]>(SEED_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<'royalty' | 'cultural' | 'civic' | 'youth'>('civic');

  const filteredEvents = events.filter(
    e => selectedCategory === 'all' || e.category === selectedCategory
  );

  const handleAddEvent = () => {
    if (!title || !date || !venue) {
      Alert.alert('Required Fields', 'Please provide event title, date, and venue.');
      return;
    }

    const newEvt: CommunityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title,
      date,
      time: time || '10:00 AM',
      venue,
      desc: desc || 'Community gathering organized by local stakeholders.',
      category,
      status: 'upcoming',
    };

    setEvents([newEvt, ...events]);
    setShowAddModal(false);
    setTitle('');
    setDate('');
    setTime('');
    setVenue('');
    setDesc('');

    Alert.alert('Event Proposed', 'Your community event has been submitted and posted to the community calendar.');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'royalty':
        return '#C9963A';
      case 'cultural':
        return '#059669';
      case 'youth':
        return '#7c3aed';
      default:
        return '#2563eb';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="COMMUNITY EVENTS"
        subtitle="Festivals, Meetings & Palace Dates"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Categories Horizontal Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryPill,
              selectedCategory === cat.id && styles.categoryPillActive,
            ]}
          >
            <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat.id && styles.categoryPillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.festivalBanner}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.bannerBadge}>UPCOMING HIGHLIGHT</Text>
            </View>
            <Text style={styles.bannerTitle}>Olipakala Festival 2026</Text>
            <Text style={styles.bannerDesc}>
              November 4, 2026 · Aafin Ologere Grounds
            </Text>
          </View>
          <Text style={{ fontSize: 36 }}>🥁</Text>
        </View>

        {/* Action Header */}
        <View style={styles.actionHeader}>
          <Text style={styles.sectionHeading}>
            Upcoming Calendar ({filteredEvents.length})
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.submitBtnText}>+ Submit Event</Text>
          </TouchableOpacity>
        </View>

        {filteredEvents.map(evt => (
          <Card key={evt.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.dateBox}>
                <Text style={styles.dateMonth}>
                  {new Date(evt.date).toLocaleString('default', { month: 'short' }).toUpperCase() || 'DATE'}
                </Text>
                <Text style={styles.dateDay}>
                  {evt.date.split('-')[2] || '01'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.tagRow}>
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: getCategoryColor(evt.category) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        { color: getCategoryColor(evt.category) },
                      ]}
                    >
                      {evt.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>⏰ {evt.time}</Text>
                </View>

                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.venueText}>📍 {evt.venue}</Text>
              </View>
            </View>

            <Text style={styles.eventDesc}>{evt.desc}</Text>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.reminderBtn}
                onPress={() =>
                  Alert.alert(
                    'Calendar Reminder',
                    `Reminder set for ${evt.title} on ${evt.date}.`
                  )
                }
              >
                <Text style={styles.reminderBtnText}>🔔 Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Submit Community Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ogere Youth Agricultural Summit"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Event Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2026-10-25"
                placeholderTextColor="#94a3b8"
                value={date}
                onChangeText={setDate}
              />

              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10:00 AM WAT"
                placeholderTextColor="#94a3b8"
                value={time}
                onChangeText={setTime}
              />

              <Text style={styles.inputLabel}>Venue *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Town Hall, Oke-Ogere"
                placeholderTextColor="#94a3b8"
                value={venue}
                onChangeText={setVenue}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.catSelectRow}>
                {(['civic', 'cultural', 'royalty', 'youth'] as const).map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      styles.catSelectPill,
                      category === c && styles.catSelectPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catSelectText,
                        category === c && styles.catSelectTextActive,
                      ]}
                    >
                      {c.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Event Description</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Details of the event..."
                placeholderTextColor="#94a3b8"
                multiline
                value={desc}
                onChangeText={setDesc}
              />
            </ScrollView>

            <View style={{ marginTop: 14, gap: 8 }}>
              <Button
                title="Publish Event"
                variant="primary"
                onPress={handleAddEvent}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
              />
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
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  festivalBanner: {
    flexDirection: 'row',
    backgroundColor: '#064e3b',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    marginBottom: 4,
  },
  bannerBadge: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  eventCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  dateBox: {
    width: 52,
    backgroundColor: '#f8fafc',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 3,
  },
  venueText: {
    fontSize: 11,
    color: '#475569',
  },
  eventDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  reminderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  reminderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  catSelectRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  catSelectPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catSelectPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catSelectText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  catSelectTextActive: {
    color: '#ffffff',
  },
});
