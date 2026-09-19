import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';
import { useAuth } from '../../services/authContext';
import { getLocalNews, getLocalKings, SeedNewsItem, SeedKingItem } from '../../database/sqlite';
import { syncManager } from '../../database/syncManager';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const [news, setNews] = useState<SeedNewsItem[]>([]);
  const [currentKing, setCurrentKing] = useState<SeedKingItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const newsList = await getLocalNews();
    setNews(newsList);
    const kingsList = await getLocalKings();
    const reigning = kingsList.find(k => k.isCurrent) || kingsList[0];
    setCurrentKing(reigning);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncManager.performDeltaSync();
    await loadContent();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onProfilePress={() => navigation.navigate('Profile')}
      />
      <OfflineNotice />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Royal Welcome Banner with Citizen Status */}
        <View style={styles.welcomeBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {user ? user.fullName.charAt(0).toUpperCase() : '👑'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeGreeting}>
                {user ? `Ẹ káàbọ̀, ${user.fullName.split(' ')[0]}!` : 'Ẹ káàbọ̀! Welcome to Ogere'}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.verifiedPill, { backgroundColor: user ? '#ecfdf5' : '#f1f5f9' }]}>
                  <Text style={[styles.verifiedPillText, { color: user ? '#059669' : '#64748b' }]}>
                    {user ? `✓ CERTIFIED ${user.citizenType.toUpperCase()}` : 'GUEST EXPLORER'}
                  </Text>
                </View>
                {user && (
                  <Text style={styles.quarterText}>· {user.quarter}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 24/7 Security & Rapid Emergency Ribbon */}
        <TouchableOpacity
          style={styles.emergencyBannerTop}
          onPress={() => navigation.navigate('IncidentReport')}
          activeOpacity={0.85}
        >
          <View style={styles.emergencyIconTop}>
            <Text style={{ fontSize: 24 }}>🚨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.emergencyTitleTop}>24/7 Security & Fast Rescue</Text>
              <View style={styles.livePulsePill}>
                <Text style={styles.livePulseText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.emergencySubtitleTop}>Multi-agency Police, FRSC & Vigilante dispatch</Text>
          </View>
          <View style={styles.callPillTop}>
            <Text style={styles.callPillTextTop}>REPORT SOS</Text>
          </View>
        </TouchableOpacity>

        {/* Civic & Tactical Quick Action Grid */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Messages')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>💬</Text>
            <Text style={styles.quickLabel}>Town Chat</Text>
            <Text style={styles.quickSub}>Town Messaging</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🗺️</Text>
            <Text style={styles.quickLabel}>Town Map</Text>
            <Text style={styles.quickSub}>GPS Sectors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Donation')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>💰</Text>
            <Text style={styles.quickLabel}>10M Fund</Text>
            <Text style={styles.quickSub}>Endowment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('WalkWithMe')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🚶‍♂️</Text>
            <Text style={styles.quickLabel}>Walk With Me</Text>
            <Text style={styles.quickSub}>Safe Escort</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Marketplace')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🛍️</Text>
            <Text style={styles.quickLabel}>Marketplace</Text>
            <Text style={styles.quickSub}>Adire & Produce</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('RoyalAudience')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🏛️</Text>
            <Text style={styles.quickLabel}>Audience</Text>
            <Text style={styles.quickSub}>With Kabiyesi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🪪</Text>
            <Text style={styles.quickLabel}>ID Wallet</Text>
            <Text style={styles.quickSub}>Digital Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Directory')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🏢</Text>
            <Text style={styles.quickLabel}>Directory</Text>
            <Text style={styles.quickSub}>Civic Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Events')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>📅</Text>
            <Text style={styles.quickLabel}>Events</Text>
            <Text style={styles.quickSub}>Festival Dates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('LandRegistry')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>📜</Text>
            <Text style={styles.quickLabel}>Land Registry</Text>
            <Text style={styles.quickSub}>Cadastral Plots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('CustomaryDispute')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>⚖️</Text>
            <Text style={styles.quickLabel}>Kootu Oba</Text>
            <Text style={styles.quickSub}>Customary Court</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('FixMyStreet')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🚧</Text>
            <Text style={styles.quickLabel}>Fix My Street</Text>
            <Text style={styles.quickSub}>Civic Faults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('DiasporaEscrow')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🌍</Text>
            <Text style={styles.quickLabel}>Diaspora Grants</Text>
            <Text style={styles.quickSub}>Escrow Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Forum')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>🗣️</Text>
            <Text style={styles.quickLabel}>Town Forum</Text>
            <Text style={styles.quickSub}>Deliberations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('TrackIncident', { incidentId: 'OGR-SOS-8419' })}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>📡</Text>
            <Text style={styles.quickLabel}>Radar Track</Text>
            <Text style={styles.quickSub}>Live Dispatch</Text>
          </TouchableOpacity>
        </View>

        {/* ── "WHAT'S ON YOUR MIND?" MOBILE STATUS UPDATE COMPOSER ── */}
        <Card style={styles.statusComposerCard}>
          <TouchableOpacity
            style={styles.composerHeaderRow}
            onPress={() => navigation.navigate('Forum')}
            activeOpacity={0.8}
          >
            <View style={styles.composerAvatar}>
              <Text style={{ fontSize: 16 }}>{user ? '👤' : '👑'}</Text>
            </View>
            <View style={styles.composerFakeInput}>
              <Text style={styles.composerPlaceholder}>
                {user ? `What's on your mind, ${user.fullName.split(' ')[0]}?` : "What's on your mind, Ogere?"} ✍️
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.composerActionsRow}>
            <TouchableOpacity
              style={styles.composerActionBtn}
              onPress={() => navigation.navigate('Forum')}
            >
              <Text style={styles.composerActionEmoji}>📸</Text>
              <Text style={styles.composerActionLabel}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.composerActionBtn}
              onPress={() => navigation.navigate('Forum')}
            >
              <Text style={styles.composerActionEmoji}>📍</Text>
              <Text style={styles.composerActionLabel}>Quarter Check-in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.composerActionBtn}
              onPress={() => navigation.navigate('Forum')}
            >
              <Text style={styles.composerActionEmoji}>💡</Text>
              <Text style={styles.composerActionLabel}>Civic Thought</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Civic Status Feed Preview */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionTitle}>Civic Status Feed</Text>
            <View style={styles.liveFeedPill}>
              <Text style={styles.liveFeedText}>LIVE</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Forum')}>
            <Text style={styles.seeAllText}>Town Feed ➔</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.civicStatusCard}>
          <View style={styles.statusAuthorRow}>
            <View style={styles.statusAuthorAvatar}>
              <Text style={{ fontSize: 16 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.statusAuthorName}>Prince Olawale Babatunde</Text>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
              <Text style={styles.statusSubText}>📍 Oke-Ogere · Palace Protocol · 15m ago</Text>
            </View>
          </View>
          <Text style={styles.statusBodyText}>
            Royal Proclamation: The 2026 Olipakala Cultural Festival schedule has been approved by Kabiyesi. Agbole delegations should submit dance rosters! 👑🎉
          </Text>
          <View style={styles.statusFooterRow}>
            <Text style={styles.statusFooterStat}>👍 28 reactions</Text>
            <Text style={styles.statusFooterStat}>💬 7 comments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Forum')}>
              <Text style={styles.statusInteractLink}>Deliberate ➔</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Current Monarch Spotlight */}
        {currentKing && (
          <Card style={styles.monarchCard}>
            <View style={styles.monarchHeader}>
              <View style={styles.monarchCrownBadge}>
                <Text style={styles.crownEmoji}>👑</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.monarchTag}>CURRENT REIGNING MONARCH</Text>
                <Text style={styles.monarchName}>{currentKing.name}</Text>
                <Text style={styles.monarchTitle}>{currentKing.title}</Text>
              </View>
            </View>
            <Text style={styles.monarchNote}>{currentKing.note}</Text>
            {currentKing.oriki && (
              <View style={styles.orikiBox}>
                <Text style={styles.orikiText}>"{currentKing.oriki}"</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('HeritageTab')}
              style={styles.exploreKingsLink}
            >
              <Text style={styles.exploreKingsText}>
                View Complete Historical Obas Lineage ➔
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Latest News & Royal Proclamations */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Palace & Community Bulletins</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewsTab')}>
            <Text style={styles.seeAllText}>See All ({news.length})</Text>
          </TouchableOpacity>
        </View>

        {news.slice(0, 3).map(item => (
          <Card
            key={item.id}
            style={styles.newsCard}
            onPress={() => navigation.navigate('NewsDetail', { item })}
          >
            <View style={styles.newsBadgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              {item.isBreaking && (
                <View style={styles.breakingBadge}>
                  <Text style={styles.breakingText}>BREAKING</Text>
                </View>
              )}
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary} numberOfLines={2}>
              {item.summary}
            </Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsAuthor}>By {item.author}</Text>
              <Text style={styles.newsReadTime}>{item.readTime}</Text>
            </View>
          </Card>
        ))}

        {/* Emergency Fast Call Banner */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => Linking.openURL('tel:122')}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIcon}>
            <Text style={{ fontSize: 24 }}>🚨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>24/7 Expressway & Police Response</Text>
            <Text style={styles.emergencySubtitle}>Tap for immediate emergency assistance</Text>
          </View>
          <View style={styles.callPill}>
            <Text style={styles.callPillText}>DIAL 122</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: 16,
  },
  welcomeBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
    ...Shadows.subtle,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  welcomeGreeting: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quarterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emergencyBannerTop: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.elevated,
  },
  emergencyIconTop: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitleTop: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  emergencySubtitleTop: {
    fontSize: 11,
    color: '#fecaca',
    marginTop: 2,
  },
  livePulsePill: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  livePulseText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  callPillTop: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  callPillTextTop: {
    color: '#b91c1c',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickCard: {
    width: '31.5%',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.subtle,
  },
  quickEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  quickSub: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  monarchCard: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  monarchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  monarchCrownBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 22,
  },
  monarchTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.goldSoft,
    letterSpacing: 0.5,
  },
  monarchName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  monarchTitle: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
  },
  monarchNote: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 19,
    marginBottom: 10,
  },
  orikiBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: 10,
  },
  orikiText: {
    fontSize: 12,
    color: Colors.goldSoft,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  exploreKingsLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  exploreKingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.goldLight,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  newsCard: {
    gap: 8,
  },
  newsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  breakingBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
  },
  newsDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  newsSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  newsAuthor: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  newsReadTime: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  emergencyBanner: {
    backgroundColor: '#b91c1c',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.elevated,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emergencySubtitle: {
    color: '#fecaca',
    fontSize: 11,
  },
  callPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  callPillText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '800',
  },
  statusComposerCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
    ...Shadows.card,
  },
  composerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#064e3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerFakeInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  composerPlaceholder: {
    fontSize: 12,
    color: '#64748b',
  },
  composerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  composerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  composerActionEmoji: {
    fontSize: 14,
  },
  composerActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  liveFeedPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  liveFeedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  civicStatusCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    ...Shadows.card,
  },
  statusAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  verifiedCheck: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1877F2',
  },
  statusSubText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statusBodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statusFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statusFooterStat: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  statusInteractLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 'auto',
  },
});
