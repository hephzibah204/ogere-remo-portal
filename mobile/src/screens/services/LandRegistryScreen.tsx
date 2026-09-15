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

interface LandPlot {
  id: string;
  area: string;
  owner: string;
  size: string;
  use: string;
  status: string;
  date: string;
  coord: string;
  disputes: number;
  documents: string;
}

const SEED_PLOTS: LandPlot[] = [
  {
    id: 'OGR-LND-104',
    area: 'Oke-Ogere / Agbole Ologere Axis',
    owner: 'Aafin Ologere Royal Trust',
    size: '12 Acres',
    use: 'Royal / Civic Heritage',
    status: 'Verified & Gazette Bound',
    date: '2025-11-14',
    coord: '6.9812° N, 3.6521° E',
    disputes: 0,
    documents: 'Palace Royal Seal & Ogun State Gazette No. 41',
  },
  {
    id: 'OGR-LND-218',
    area: 'Lagos-Ibadan Expressway Commercial Strip',
    owner: 'Ogere Agro-Allied Logistics Park',
    size: '45 Plots',
    use: 'Commercial / Warehousing',
    status: 'Verified & Gazette Bound',
    date: '2026-02-10',
    coord: '6.9740° N, 3.6398° E',
    disputes: 0,
    documents: 'Ogun State C-of-O & OCDA Cadastral Survey Plan 882',
  },
  {
    id: 'OGR-LND-305',
    area: 'Ijana Quarters, Central Ogere',
    owner: 'Adelana-Osifayo Family Estate',
    size: '6 Plots',
    use: 'Residential & Family Compound',
    status: 'Verified & Gazette Bound',
    date: '2026-03-01',
    coord: '6.9854° N, 3.6492° E',
    disputes: 0,
    documents: 'Ogun State Registered Conveyance Plan 410',
  },
  {
    id: 'OGR-LND-419',
    area: 'Wasimi / Solar Mini-Grid Axis',
    owner: 'Ogere Community Development Association (OCDA)',
    size: '8 Plots',
    use: 'Civic Utility / Solar Power Plant',
    status: 'Verified & Gazette Bound',
    date: '2026-04-18',
    coord: '6.9890° N, 3.6610° E',
    disputes: 0,
    documents: 'Community Deed of Gift & Survey 2026-SOLAR-01',
  },
  {
    id: 'OGR-LND-512',
    area: 'Oke-Ipa Agricultural Belt',
    owner: 'Chief Oladipo Sobanjo & Kin',
    size: '18 Acres',
    use: 'Agricultural / Cassava Cultivation',
    status: 'Pending Field Survey',
    date: '2026-08-22',
    coord: '6.9925° N, 3.6705° E',
    disputes: 0,
    documents: 'Family Title Deed & Preliminary Layout Sketch',
  },
];

export const LandRegistryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [plots, setPlots] = useState<LandPlot[]>(SEED_PLOTS);
  const [search, setSearch] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form
  const [ownerName, setOwnerName] = useState('');
  const [area, setArea] = useState('');
  const [size, setSize] = useState('');
  const [useType, setUseType] = useState('Residential');
  const [contact, setContact] = useState('');

  const filteredPlots = plots.filter(
    p =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegisterPlot = () => {
    if (!ownerName || !area || !size) {
      Alert.alert('Incomplete Form', 'Please enter owner name, plot location area, and land size.');
      return;
    }

    const newPlot: LandPlot = {
      id: `OGR-LND-${Math.floor(100 + Math.random() * 900)}`,
      area,
      owner: ownerName,
      size,
      use: useType,
      status: 'Pending Field Survey',
      date: new Date().toISOString().split('T')[0],
      coord: '6.9800° N, 3.6500° E (Pending Survey)',
      disputes: 0,
      documents: 'Application filed via Mobile App · Queued for Palace Surveyor inspection',
    };

    setPlots([newPlot, ...plots]);
    setShowRegisterModal(false);
    setOwnerName('');
    setArea('');
    setSize('');
    setContact('');

    Alert.alert(
      'Application Submitted',
      `Plot reference ${newPlot.id} has been logged in the community cadastral queue. A palace land surveyor will review boundary coordinates.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="LAND REGISTRY"
        subtitle="Cadastral Archive & Ownership"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Land ID, Owner or Area..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => setShowRegisterModal(true)}
        >
          <Text style={styles.registerBtnText}>+ Register Plot</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBanner}>
          <Text style={{ fontSize: 20 }}>📜</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Official Community Cadastral Registry</Text>
            <Text style={styles.infoDesc}>
              Securing Ogereland against double-selling, encroachment, and unauthorized acquisition.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Recorded Community Plots ({filteredPlots.length})
        </Text>

        {filteredPlots.map(plot => (
          <Card
            key={plot.id}
            style={styles.plotCard}
            onPress={() => setSelectedPlot(plot)}
          >
            <View style={styles.plotHeader}>
              <View>
                <Text style={styles.plotId}>{plot.id}</Text>
                <Text style={styles.plotOwner}>{plot.owner}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  plot.status.includes('Verified')
                    ? styles.statusVerified
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    plot.status.includes('Verified')
                      ? { color: '#065f46' }
                      : { color: '#92400e' },
                  ]}
                >
                  {plot.status.includes('Verified') ? '✓ VERIFIED' : '⏳ PENDING'}
                </Text>
              </View>
            </View>

            <View style={styles.plotDetailsRow}>
              <Text style={styles.detailText}>📍 {plot.area}</Text>
              <Text style={styles.detailText}>📐 {plot.size} · {plot.use}</Text>
            </View>

            <View style={styles.plotFooter}>
              <Text style={styles.disputeText}>
                {plot.disputes === 0 ? '🟢 No Active Disputes' : '🔴 Dispute Flagged'}
              </Text>
              <Text style={styles.viewMoreText}>View Cadastral Record ➔</Text>
            </View>
          </Card>
        ))}

        {filteredPlots.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching land records</Text>
            <Text style={styles.emptyDesc}>Try searching with a different parcel ID, quarter or family name.</Text>
          </View>
        )}
      </ScrollView>

      {/* Plot Details Modal */}
      <Modal
        visible={!!selectedPlot}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPlot(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedPlot && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalSub}>COMMUNITY CADASTRAL RECORD</Text>
                    <Text style={styles.modalPlotId}>{selectedPlot.id}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPlot(null)}>
                    <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 380 }}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Registered Owner / Compound:</Text>
                    <Text style={styles.fieldValue}>{selectedPlot.owner}</Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Location & Area:</Text>
                    <Text style={styles.fieldValue}>{selectedPlot.area}</Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>GPS Coordinates:</Text>
                    <Text style={[styles.fieldValue, { fontFamily: 'monospace', color: Colors.primary }]}>
                      {selectedPlot.coord}
                    </Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Parcel Dimensions & Permitted Use:</Text>
                    <Text style={styles.fieldValue}>{selectedPlot.size} — {selectedPlot.use}</Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Archival Documentation:</Text>
                    <Text style={styles.fieldValue}>{selectedPlot.documents}</Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Legal Status:</Text>
                    <Text style={[styles.fieldValue, { color: '#047857', fontWeight: '800' }]}>
                      {selectedPlot.status}
                    </Text>
                  </View>
                </ScrollView>

                <Button
                  title="Close Record"
                  variant="secondary"
                  onPress={() => setSelectedPlot(null)}
                  style={{ marginTop: 16 }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Register New Plot Modal */}
      <Modal
        visible={showRegisterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSub}>OGERE CIVIC CADASTRE</Text>
                <Text style={styles.modalPlotId}>Register Land Plot</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Owner / Family Compound Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Chief Adeleke Agbole Osifayo"
                placeholderTextColor="#94a3b8"
                value={ownerName}
                onChangeText={setOwnerName}
              />

              <Text style={styles.inputLabel}>Location / Street / Axis in Ogere *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Along Old Sagamu Road, Oke-Ogere"
                placeholderTextColor="#94a3b8"
                value={area}
                onChangeText={setArea}
              />

              <Text style={styles.inputLabel}>Size of Land *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 2 Plots (120ft x 120ft)"
                placeholderTextColor="#94a3b8"
                value={size}
                onChangeText={setSize}
              />

              <Text style={styles.inputLabel}>Intended Land Use</Text>
              <View style={styles.useRow}>
                {['Residential', 'Commercial', 'Agricultural', 'Civic'].map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUseType(u)}
                    style={[
                      styles.usePill,
                      useType === u && styles.usePillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.usePillText,
                        useType === u && styles.usePillTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Phone Number / WhatsApp Contact</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 0803XXXXXXX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
              />
            </ScrollView>

            <View style={{ marginTop: 16, gap: 8 }}>
              <Button
                title="Submit for Surveyor Review"
                variant="primary"
                onPress={handleRegisterPlot}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowRegisterModal(false)}
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
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
  },
  infoDesc: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  plotCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plotId: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  plotOwner: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusVerified: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  plotDetailsRow: {
    gap: 3,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
  },
  plotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  disputeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  viewMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  modalSub: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  modalPlotId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  useRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  usePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  usePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  usePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  usePillTextActive: {
    color: '#ffffff',
  },
});
