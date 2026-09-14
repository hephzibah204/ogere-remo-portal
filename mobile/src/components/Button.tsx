import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadows } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  haptic?:    boolean;               // trigger haptic feedback on press
  fullWidth?: boolean;               // stretch to full container width
  style?:     ViewStyle;
  textStyle?: TextStyle;
  icon?:      React.ReactNode;       // leading icon
  iconRight?: React.ReactNode;       // trailing icon
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  haptic    = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconRight,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(
        variant === 'danger'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    onPress();
  };

  const containerStyles: ViewStyle[] = [
    styles.button,
    styles[`size_${size}` as keyof typeof styles] as ViewStyle,
    styles[`btn_${variant}` as keyof typeof styles] as ViewStyle,
    ...(disabled || loading ? [styles.disabled] : []),
    ...(fullWidth ? [styles.fullWidth] : []),
    ...(variant === 'danger' ? [Shadows.danger as ViewStyle] : []),
    ...(style ? [style] : []),
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`textSize_${size}` as keyof typeof styles] as TextStyle,
    styles[`text_${variant}` as keyof typeof styles] as TextStyle,
    ...(textStyle ? [textStyle] : []),
  ];

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? Colors.primary
      : '#ffffff';

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text style={textStyles}>{title}</Text>
          {iconRight}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: { width: '100%' },

  // sizes
  size_sm: { paddingVertical: 8,  paddingHorizontal: 14 },
  size_md: { paddingVertical: 13, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24 },

  // variants
  btn_primary:   { backgroundColor: Colors.primary },
  btn_secondary: { backgroundColor: Colors.gold },
  btn_outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  btn_ghost:     { backgroundColor: 'transparent' },
  btn_danger:    { backgroundColor: '#dc2626' },

  disabled: { opacity: 0.5 },

  // text base
  text: { fontWeight: '700', letterSpacing: 0.2 },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },

  // text per variant
  text_primary:   { color: '#ffffff' },
  text_secondary: { color: '#ffffff' },
  text_outline:   { color: Colors.primary },
  text_ghost:     { color: Colors.primary },
  text_danger:    { color: '#ffffff' },
});

