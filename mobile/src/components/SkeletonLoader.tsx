import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Radius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Single shimmer bar */
function SkeletonBar({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900,  useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900,  useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: 'rgba(201,150,58,0.18)', opacity },
        style,
      ]}
    />
  );
}

/** Card skeleton — mimics a feature or news card */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBar height={140} borderRadius={10} style={styles.img} />
      <View style={styles.body}>
        <SkeletonBar height={14} width="60%" />
        <SkeletonBar height={20} style={{ marginTop: 8 }} />
        <SkeletonBar height={14} width="85%" style={{ marginTop: 6 }} />
        <SkeletonBar height={14} width="70%" style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

/** List-row skeleton */
export function RowSkeleton() {
  return (
    <View style={styles.row}>
      <SkeletonBar width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBar height={14} width="70%" />
        <SkeletonBar height={12} width="50%" />
      </View>
    </View>
  );
}

/** Generic bar */
export default SkeletonBar;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(201,150,58,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.12)',
    marginBottom: 16,
  },
  img:  { borderRadius: 0 },
  body: { padding: 14, gap: 6 },
  row:  {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,150,58,0.08)',
  },
});
