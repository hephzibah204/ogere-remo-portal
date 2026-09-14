import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius } from '../../theme';
import { getLocalNews, SeedNewsItem } from '../../database/sqlite';
import { syncManager } from '../../database/syncManager';

const CATEGORIES = [
  'All',
  'Palace Proclamation',
  'Economy & Jobs',
  'Culture & Heritage',
  'Civic Services',
  'Health & Welfare',
];

export const NewsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [articles, setArticles] = useState<SeedNewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const list = await getLocalNews();
    setArticles(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncManager.performDeltaSync();
    await loadNews();
    setRefreshing(false);
  };

  const filteredArticles = articles.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="PALACE & TOWN NEWS" subtitle="Offline Bulletins & Updates" />
      <OfflineNotice />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search news, proclamations & events..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.catPill,
                selectedCategory === cat && styles.catPillActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  selectedCategory === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Feed List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📰</Text>
            <Text style={styles.emptyTitle}>No Articles Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or select another category.
            </Text>
          </View>
        ) : (
          filteredArticles.map(item => (
            <Card
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('NewsDetail', { item })}
            >
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                {item.isBreaking && (
                  <View style={styles.breakingBadge}>
                    <Text style={styles.breakingText}>BREAKING</Text>
                  </View>
                )}
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.summaryText} numberOfLines={2}>
                {item.summary}
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.authorText}>By {item.author}</Text>
                <Text style={styles.readTimeText}>{item.readTime}</Text>
              </View>
            </Card>
          ))
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
  searchWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
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
  },
  categoriesWrapper: {
    paddingVertical: Spacing.sm,
  },
  catScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: 12,
  },
  card: {
    gap: 8,
  },
  badgeRow: {
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
  categoryText: {
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
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  authorText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
