import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';
import { FieldStatus } from '../types';

interface BadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const isActive = status === 'Hoạt động';
  const badgeStyle = isActive ? styles.activeContainer : styles.maintenanceContainer;
  const textStyle = isActive ? styles.activeText : styles.maintenanceText;
  const dotStyle = isActive ? styles.activeDot : styles.maintenanceDot;
  const dotRingStyle = isActive ? styles.activeDotRing : styles.maintenanceDotRing;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        badgeStyle,
      ]}
    >
      <View style={[styles.dotRing, dotRingStyle]}>
        <View style={[styles.dot, dotStyle]} />
      </View>
      <Text style={[styles.text, size === 'sm' ? styles.textSm : styles.textMd, textStyle]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
  },
  dotRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: 12,
  },
  textSm: {
    fontSize: 11,
  },
  activeContainer: {
    backgroundColor: colors.statusActive.bg,
    borderColor: colors.statusActive.border,
  },
  activeDotRing: {
    backgroundColor: colors.statusActive.accent,
  },
  activeDot: {
    backgroundColor: colors.statusActive.indicator,
  },
  activeText: {
    color: colors.statusActive.text,
  },
  maintenanceContainer: {
    backgroundColor: colors.statusMaintenance.bg,
    borderColor: colors.statusMaintenance.border,
  },
  maintenanceDotRing: {
    backgroundColor: colors.statusMaintenance.accent,
  },
  maintenanceDot: {
    backgroundColor: colors.statusMaintenance.indicator,
  },
  maintenanceText: {
    color: colors.statusMaintenance.text,
  },
});

export default Badge;
