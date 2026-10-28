import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'outline' | 'ghost' | 'softDanger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    if (disabled) {
      return styles.disabledContainer;
    }
    switch (variant) {
      case 'danger':
        return styles.dangerContainer;
      case 'softDanger':
        return styles.softDangerContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return styles.disabledText;
    }
    switch (variant) {
      case 'danger':
        return styles.dangerText;
      case 'softDanger':
        return styles.softDangerText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.baseButton, getSizeStyle(), getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary
              : variant === 'softDanger'
              ? colors.error
              : colors.textWhite
          }
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.xs + 2,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sizeSm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minHeight: 34,
  },
  sizeMd: {
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
  },
  sizeLg: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryText: {
    color: colors.textWhite,
    fontSize: 14,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.textWhite,
    fontSize: 14,
  },
  softDangerContainer: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  softDangerText: {
    color: colors.error,
    fontSize: 13,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  secondaryText: {
    color: colors.textWhite,
    fontSize: 14,
  },
  outlineContainer: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
  },
  outlineText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
    fontSize: 14,
  },
  disabledContainer: {
    backgroundColor: colors.disabledBg,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
  },
  disabledText: {
    color: colors.disabledText,
    fontSize: 14,
  },
});

export default CustomButton;
