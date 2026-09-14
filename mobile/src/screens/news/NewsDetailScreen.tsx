import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { SeedNewsItem } from '../../database/seedData';

export const NewsDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const item: SeedNewsItem = route.params?.item;

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>Article not found.</Text>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: item.title,
        message: `${item.title}\n\nRead more on the Ogere Remo Civic Mobile App or visit https://ogereremo.vercel.app`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Detail Top Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to News</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share 📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category & Date Banner */}
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dateText}>{item.date} · {item.readTime}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Author / Source */}
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={{ fontSize: 16 }}>🏛️</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.authorRole}>Official Ogere Remo Publication</Text>
          </View>
        </View>

        {/* Offline Badge */}
        <View style={styles.offlineBox}>
          <Text style={styles.offlineBoxText}>
            ✓ Article cached locally — available 100% offline anytime
          </Text>
        </View>

        {/* Summary Lead */}
        <Text style={styles.summaryLead}>{item.summary}</Text>

        {/* Main Body */}
        <Text style={styles.bodyText}>{item.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    paddingVertical: 4,
  },
  shareBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  authorRole: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  offlineBox: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  offlineBoxText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  summaryLead: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bodyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 25,
  },
});
