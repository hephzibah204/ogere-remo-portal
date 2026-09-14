import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Shadows, Spacing, Typography } from '../theme';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  tag?: string;
  onPress?: () => void;
  featured?: boolean;   // gold border + shadow
  danger?: boolean;     // red border — for SOS / emergency cards
}

export default function FeatureCard({
  icon,
  title,
  description,
  tag,
  onPress,
  featured = false,
  danger = false,
}: FeatureCardProps) {
  const borderColor = danger
    ? '#ef4444'
    : featured
    ? Colors.gold
    : 'rgba(201,150,58,0.18)';

  const shadow = danger ? Shadows.danger : featured ? Shadows.gold : Shadows.card;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.wrapper, { borderColor }, shadow]}
    >
      <LinearGradient
        colors={
          danger
            ? ['rgba(239,68,68,0.08)', 'rgba(13,7,4,0.95)']
            : featured
            ? ['rgba(201,150,58,0.12)', 'rgba(13,7,4,0.95)']
            : ['rgba(201,150,58,0.04)', 'rgba(13,7,4,0.98)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top row — icon + tag */}
        <View style={styles.topRow}>
          <Text style={styles.icon}>{icon}</Text>
          {tag && (
            <View style={[styles.tagPill, danger && styles.tagDanger, featured && styles.tagFeatured]}>
              <Text style={[styles.tagText, danger && { color: '#ef4444' }, featured && { color: Colors.gold }]}>
                {tag}
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, danger && { color: '#fca5a5' }]}>{title}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>{description}</Text>

        {/* Footer indicator */}
        {onPress && (
          <Text style={[styles.cta, danger && { color: '#f87171' }]}>
            {danger ? '🚨 View Emergency' : featured ? '✦ Explore →' : 'View details →'}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  gradient: {
    padding: Spacing.md + 2,
    gap: Spacing.sm - 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  icon: { fontSize: 28 },
  tagPill: {
    backgroundColor: 'rgba(201,150,58,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagFeatured: { backgroundColor: 'rgba(201,150,58,0.15)', borderColor: Colors.gold },
  tagDanger:   { backgroundColor: 'rgba(239,68,68,0.1)',   borderColor: '#ef4444' },
  tagText: {
    ...Typography.overline,
    color: Colors.textMuted,
  } as any,
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  description: {
    ...Typography.body,
    lineHeight: 21,
    opacity: 0.8,
  },
  cta: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
});
