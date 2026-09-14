import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius } from '../../theme';
import { getLocalKings, SeedKingItem } from '../../database/sqlite';

const TABS = ['Obas Lineage', 'Royal Houses', 'Oriki Ogere'];

const RULING_HOUSES = [
  {
    icon: '👑',
    name: 'Kankanbina / Ejigboye Ruling House',
    desc: 'Currently reigning royal house producing HRM Oba James Obafemi Saliu (Kankanbiina II), enthroned in April 2023.',
  },
  {
    icon: '⚔️',
    name: 'Legunsen Ruling House',
    desc: 'The founding royal house. Produced Oba Adelana Osifayo (Legunsen I) and Oba Alfred Obafuwa Babington-Ashaye (Legunsen III, 1945–1982).',
  },
  {
    icon: '🌿',
    name: 'Agbejoye / Fadagbuwa Ruling House',
    desc: 'Produced the legendary monarch Oba Oladele Moshood Ogunbade (Agbejoye II), who reigned for over 38 years (1983–2022).',
  },
  {
    icon: '🏺',
    name: 'Oregunsen Ruling House',
    desc: 'The fourth respected royal dynasty entitled to contest and present candidates for the ancient stool of the Ologere.',
  },
];

const ORIKI_LINES = [
  'Ogere mogbo, Ogere ota, ni le onireke.',
  'Omo Lipakala agbeni madein, re folugboro oloyo poyo, o fi Ori oloyo dakere.',
  'Omo Yemogun atatameti, elebiripo ijimiji, ti sale ko jina, ti toke jinna.',
  'Omo itun epe, agbade sori yan gbendeke.',
  'Omo olowo Joye Meji po, o tun reti eketa.',
  'Omo arojojoye, adele tejiteji. Ojoye titi, o tun je sikuloye.',
  'Borokini dara dele ko to joba, aguntaso lo, olowo ladugbo baba Tinuade.',
  'Ara Ijebu ode, Ijebu Ode-ajagbalura, eyin lomo a fidi pote mole, alagemo merindinlogun.',
  'Omo Lagere, lagboole Iremo, nile Ife Odaaye ni bi ojumo ti n mo wa.',
  'Kabiyeesi alase, igbakeji orisa, didun ni iranti olododo!'
];

export const HeritageScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Obas Lineage');
  const [kings, setKings] = useState<SeedKingItem[]>([]);

  useEffect(() => {
    loadKings();
  }, []);

  const loadKings = async () => {
    const list = await getLocalKings();
    setKings(list);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="ROYAL HERITAGE" subtitle="Monarchy, Lineage & Oriki" />
      <OfflineNotice />

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'Obas Lineage' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionHeading}>
              Historical Succession of the Ologere of Ogere
            </Text>
            <Text style={styles.sectionSubtitle}>
              Archival records preserved by the Palace of the Ologere and the Ogun State Chieftaincy Council.
            </Text>

            {kings.map((king, idx) => (
              <Card
                key={idx}
                style={[
                  styles.kingCard,
                  king.isCurrent && styles.reigningKingCard,
                ]}
              >
                <View style={styles.kingHeader}>
                  <View
                    style={[
                      styles.kingIconCircle,
                      king.isCurrent && { backgroundColor: Colors.gold },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>👑</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    {king.isCurrent && (
                      <View style={styles.reigningPill}>
                        <Text style={styles.reigningPillText}>REIGNING MONARCH</Text>
                      </View>
                    )}
                    <Text style={styles.kingName}>{king.name}</Text>
                    <Text style={styles.kingTitle}>{king.title}</Text>
                    <Text style={styles.kingEra}>Reign: {king.era}</Text>
                  </View>
                </View>

                <View style={styles.houseBadge}>
                  <Text style={styles.houseText}>House: {king.house}</Text>
                </View>

                <Text style={styles.kingNote}>{king.note}</Text>

                {king.oriki && (
                  <View style={styles.kingOriki}>
                    <Text style={styles.kingOrikiTitle}>Personal Oriki:</Text>
                    <Text style={styles.kingOrikiText}>"{king.oriki}"</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Royal Houses' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionHeading}>The Four Ruling Dynasties</Text>
            <Text style={styles.sectionSubtitle}>
              Traditional royal rotation recognized under the Chiefs Law of Ogun State.
            </Text>

            {RULING_HOUSES.map((house, idx) => (
              <Card key={idx} style={styles.houseCard}>
                <View style={styles.houseHeader}>
                  <Text style={{ fontSize: 28 }}>{house.icon}</Text>
                  <Text style={styles.houseTitle}>{house.name}</Text>
                </View>
                <Text style={styles.houseDesc}>{house.desc}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Oriki Ogere' && (
          <View style={styles.tabSection}>
            <Card style={styles.orikiContainerCard}>
              <View style={styles.orikiHeader}>
                <Text style={styles.orikiTitle}>Oriki Ilu Ogere Remo</Text>
                <Text style={styles.orikiSub}>Traditional Praise Poetry of the Homeland</Text>
              </View>

              <View style={styles.linesWrapper}>
                {ORIKI_LINES.map((line, idx) => (
                  <View key={idx} style={styles.lineRow}>
                    <Text style={styles.lineIndex}>{idx + 1}.</Text>
                    <Text style={styles.lineContent}>{line}</Text>
                  </View>
                ))}
              </View>
            </Card>
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
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  tabSection: {
    gap: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  kingCard: {
    gap: 8,
  },
  reigningKingCard: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
    backgroundColor: '#fffdf5',
  },
  kingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  kingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reigningPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  reigningPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  kingName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  kingTitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  kingEra: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  houseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  houseText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  kingNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  kingOriki: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  kingOrikiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  kingOrikiText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#78350f',
    lineHeight: 17,
  },
  houseCard: {
    gap: 8,
  },
  houseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  houseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  houseDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  orikiContainerCard: {
    padding: Spacing.lg,
    backgroundColor: '#064e3b',
  },
  orikiHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: Spacing.md,
  },
  orikiTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.goldLight,
  },
  orikiSub: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 4,
  },
  linesWrapper: {
    gap: 12,
  },
  lineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lineIndex: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '700',
    width: 22,
  },
  lineContent: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
