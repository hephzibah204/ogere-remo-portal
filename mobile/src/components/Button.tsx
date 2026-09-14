import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.button, styles[`size_${size}`]];

    if (variant === 'primary') base.push(styles.btnPrimary);
    if (variant === 'secondary') base.push(styles.btnSecondary);
    if (variant === 'outline') base.push(styles.btnOutline);
    if (variant === 'ghost') base.push(styles.btnGhost);

    if (disabled || loading) base.push(styles.disabled);
    if (style) base.push(style);

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.text, styles[`textSize_${size}`]];

    if (variant === 'primary') base.push(styles.textPrimary);
    if (variant === 'secondary') base.push(styles.textSecondary);
    if (variant === 'outline') base.push(styles.textOutline);
    if (variant === 'ghost') base.push(styles.textGhost);

    if (textStyle) base.push(textStyle);

    return base;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#ffffff'}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  size_md: {
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.gold,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontWeight: '700',
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textPrimary: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#ffffff',
  },
  textOutline: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.primary,
  },
});
