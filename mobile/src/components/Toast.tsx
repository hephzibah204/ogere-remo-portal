import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(34,197,94,0.12)',   border: '#22c55e', icon: '✅' },
  error:   { bg: 'rgba(239,68,68,0.12)',    border: '#ef4444', icon: '🚨' },
  warning: { bg: 'rgba(245,158,11,0.12)',   border: '#f59e0b', icon: '⚠️' },
  info:    { bg: 'rgba(201,150,58,0.12)',   border: Colors.gold, icon: 'ℹ️' },
};

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 3500,
  onHide,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const { bg, border, icon } = TYPE_STYLES[type];

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity,    { toValue: 0,    duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: border, transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onHide} accessibilityLabel="Dismiss notification">
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  icon:    { fontSize: 18 },
  message: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  close:   { fontSize: 16, color: Colors.textMuted, paddingLeft: Spacing.xs },
});
