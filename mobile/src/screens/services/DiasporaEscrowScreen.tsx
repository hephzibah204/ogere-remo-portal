// mobile/src/screens/services/DiasporaEscrowScreen.tsx
// Diaspora Homeland Capital Projects & Milestone Escrow Grants Portal

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { Header } from '../../components/Header';
import {
  EscrowProject,
  getEscrowProjects,
} from '../../services/diasporaEscrowService';

export const DiasporaEscrowScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [projects, setProjects] = useState<EscrowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<EscrowProject | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getEscrowProjects();
    setProjects(data);
    setSelectedProject(data[0] || null);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="DIASPORA ESCROW GRANTS"
        subtitle="Transparent Milestone-Locked Homeland Funding"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <Text style={{ fontSize: 24 }}>🌍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Ogere Diaspora Escrow Vault</Text>
            <Text style={styles.heroSubtitle}>
              Funds remain safely locked in escrow and are ONLY disbursed upon physical on-ground milestone verification.
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          projects.map((proj) => (
            <View key={proj.id} style={styles.projCard}>
              <View style={styles.projHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catText}>{proj.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        proj.status === 'COMPLETED'
                          ? '#dcfce7'
                          : proj.status === 'IN_EXECUTION'
                          ? '#fef3c7'
                          : '#e0f2fe',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          proj.status === 'COMPLETED'
                            ? '#15803d'
                            : proj.status === 'IN_EXECUTION'
                            ? '#b45309'
                            : '#0369a1',
                      },
                    ]}
                  >
                    {proj.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <Text style={styles.projTitle}>{proj.title}</Text>
              <Text style={styles.projLocation}>📍 {proj.location}</Text>
              <Text style={styles.projDesc}>{proj.description}</Text>

              {/* Progress Bar */}
              <View style={{ marginVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.progressLabel}>Overall Completion</Text>
                  <Text style={styles.progressVal}>{proj.completionPercentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${proj.completionPercentage}%` }]} />
                </View>
              </View>

              {/* Financial Breakdown */}
              <View style={styles.financialGrid}>
                <View style={styles.finCol}>
                  <Text style={styles.finLabel}>Target Budget</Text>
                  <Text style={styles.finVal}>₦{(proj.targetBudgetNgn / 1000000).toFixed(1)}M</Text>
                </View>
                <View style={styles.finCol}>
                  <Text style={styles.finLabel}>Locked in Escrow</Text>
                  <Text style={[styles.finVal, { color: '#C9963A' }]}>₦{(proj.escrowLockedNgn / 1000000).toFixed(1)}M</Text>
                </View>
                <View style={styles.finCol}>
                  <Text style={styles.finLabel}>Released (Verified)</Text>
                  <Text style={[styles.finVal, { color: '#4ade80' }]}>₦{(proj.releasedNgn / 1000000).toFixed(1)}M</Text>
                </View>
              </View>

              {/* Milestones List */}
              <Text style={styles.milestoneHeading}>🛡️ Milestone Release Stages</Text>
              {proj.milestones.map((m) => (
                <View key={m.id} style={styles.mCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.mTitle}>{m.title}</Text>
                    <View
                      style={[
                        styles.mStatusPill,
                        {
                          backgroundColor:
                            m.status === 'RELEASED'
                              ? '#dcfce7'
                              : m.status === 'VERIFICATION_PENDING'
                              ? '#fef3c7'
                              : '#334155',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mStatusText,
                          {
                            color:
                              m.status === 'RELEASED'
                                ? '#15803d'
                                : m.status === 'VERIFICATION_PENDING'
                                ? '#b45309'
                                : '#94a3b8',
                          },
                        ]}
                      >
                        {m.status === 'RELEASED' ? '✅ PAID' : m.status === 'VERIFICATION_PENDING' ? '⏳ AUDIT' : '🔒 LOCKED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.mAmount}>Grant Value: ₦{m.amountNgn.toLocaleString()}</Text>
                  <Text style={styles.mEvidence}>📋 Audit Evidence: {m.evidence}</Text>
                </View>
              ))}

              <View style={styles.supervisorRow}>
                <Text style={styles.supervisorText}>👷 Lead: {proj.leadContractor}</Text>
                <Text style={styles.supervisorText}>👑 Palace Signatory: {proj.palaceSignatory}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(201, 150, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 150, 58, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9963A',
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
    lineHeight: 15,
  },
  projCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catBadge: {
    backgroundColor: 'rgba(201, 150, 58, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C9963A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  projTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  projLocation: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
  },
  projDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  progressVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C9963A',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C9963A',
  },
  financialGrid: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
  finCol: {
    flex: 1,
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
  },
  finVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  milestoneHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#cbd5e1',
    marginTop: 6,
    marginBottom: 8,
  },
  mCard: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  mStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  mAmount: {
    fontSize: 10,
    color: '#C9963A',
    fontWeight: '700',
    marginTop: 2,
  },
  mEvidence: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  supervisorRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  supervisorText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
});
