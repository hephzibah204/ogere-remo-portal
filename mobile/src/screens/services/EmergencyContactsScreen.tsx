import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';
import { useAuth } from '../../services/authContext';
import { API_BASE_URL } from '../../database/syncManager';

const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Close Friend', 'Neighbor'];

export const EmergencyContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [notifyOnSos, setNotifyOnSos] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.id || 'default_user';

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/contacts?action=list&userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.warn('Could not fetch emergency contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Incomplete Details', 'Please provide both a contact name and valid phone number.');
      return;
    }

    if (contacts.length >= 3) {
      Alert.alert('Maximum Limit Reached', 'You can register a maximum of 3 Guardian emergency contacts.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          userId,
          name: name.trim(),
          phone: phone.trim(),
          relationship,
          notifyOnSos,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Guardian Registered', `${name} is now connected to your emergency beacon circle.`);
        setName('');
        setPhone('');
        setShowAddForm(false);
        fetchContacts();
      } else {
        Alert.alert('Registration Failed', data.error || 'Could not save guardian contact.');
      }
    } catch {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert(
      'Remove Guardian?',
      `Are you sure you want to remove ${contactName} from your emergency circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'delete',
                  id: contactId,
                  userId,
                }),
              });
              if (res.ok) {
                fetchContacts();
              }
            } catch (err) {
              Alert.alert('Error', 'Could not remove contact right now.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="GUARDIAN CIRCLES" subtitle="Emergency Family & Kin Network" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 26 }}>👨‍👩‍👧‍👦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Instant SOS Family Dispatches</Text>
              <Text style={styles.infoText}>
                Register up to 3 trusted guardians. When you press SOS or enter your Duress PIN, they instantly receive SMS alerts and a direct public live tracking radar link.
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Your Guardians ({contacts.length}/3)
          </Text>
          {contacts.length < 3 && !showAddForm && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addBtnText}>+ Add Guardian</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : contacts.length === 0 && !showAddForm ? (
          <Card style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Guardians Registered Yet</Text>
            <Text style={styles.emptyDesc}>
              Add trusted family members or friends who should be immediately alerted when you trigger an emergency in Ogere Remo.
            </Text>
            <Button
              title="+ Add First Guardian"
              variant="primary"
              onPress={() => setShowAddForm(true)}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : null}

        {/* Existing Contacts List */}
        {contacts.map((c) => (
          <Card key={c.id} style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{c.relationship || 'Guardian'}</Text>
                  </View>
                </View>
                <Text style={styles.contactPhone}>📞 {c.phone}</Text>
                {c.notify_on_sos && (
                  <Text style={styles.sosTag}>⚡ Instant Live Radar Link via SMS</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteContact(c.id, c.name)}
                style={styles.trashBtn}
              >
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Add Contact Form Card */}
        {showAddForm && (
          <Card style={styles.formCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.formTitle}>Register New Guardian</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Text style={{ fontSize: 16, color: Colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chief Adebayo, Sister Funke"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>PHONE NUMBER (FOR INSTANT SMS)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0803 123 4567"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>RELATIONSHIP</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
              {RELATIONSHIPS.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[styles.relChip, relationship === rel && styles.relChipActive]}
                  onPress={() => setRelationship(rel)}
                >
                  <Text style={[styles.relText, relationship === rel && styles.relTextActive]}>
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setNotifyOnSos(!notifyOnSos)}
            >
              <Text style={{ fontSize: 18 }}>{notifyOnSos ? '☑️' : '⬜'}</Text>
              <Text style={styles.toggleText}>
                Transmit Live GPS Map link immediately upon SOS alert
              </Text>
            </TouchableOpacity>

            <Button
              title={submitting ? 'Registering...' : 'Save Guardian to Circle'}
              variant="primary"
              onPress={handleAddContact}
              loading={submitting}
              style={{ marginTop: 10 }}
            />
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
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 16,
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 280,
  },
  contactCard: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  contactPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sosTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  trashBtn: {
    padding: 8,
  },
  formCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  relChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  relChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  relText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  relTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  toggleText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
});
