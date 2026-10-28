import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { FootballField } from '../types';
import { formatCurrencyPerHour } from '../utils/formatters';
import Badge from './Badge';

interface FieldCardProps {
  field: FootballField;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  bookingCount?: number;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  onPress,
  onEdit,
  onDelete,
  bookingCount = 0,
}) => {
  const isMaintenance = field.status === 'Bảo trì';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, isMaintenance && styles.cardMaintenance]}
    >
      {/* Vạch màu định vị bên trái thẻ */}
      <View
        style={[
          styles.accentBar,
          isMaintenance ? styles.accentBarMaintenance : styles.accentBarActive,
        ]}
      />

      <View style={styles.innerContent}>
        {/* Hàng trên: Tên sân, Loại sân & Nhãn trạng thái */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {field.type === '5 người' ? '⚽ 5 người' : '🏟️ 7 người'}
              </Text>
            </View>
          </View>
          <Badge status={field.status} size="sm" />
        </View>

        {/* Hàng giữa: Giá thuê niêm yết & Số lượt đặt */}
        <View style={styles.infoRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá thuê:</Text>
            <Text style={styles.priceValue}>
              {formatCurrencyPerHour(field.pricePerHour)}
            </Text>
          </View>

          {bookingCount > 0 ? (
            <View style={styles.bookingBadge}>
              <Text style={styles.bookingBadgeText}>
                📅 {bookingCount} lượt đặt
              </Text>
            </View>
          ) : (
            <View style={styles.emptyBookingBadge}>
              <Text style={styles.emptyBookingText}>Trống lịch</Text>
            </View>
          )}
        </View>

        {/* Đường kẻ phân cách viền mờ */}
        <View style={styles.divider} />

        {/* Hàng chân thẻ: Gợi ý thao tác & Nút Sửa / Xoá */}
        <View style={styles.footerRow}>
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Chi tiết & Đặt sân</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </View>

          <View style={styles.actionsGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.editBtn}
              accessibilityLabel={`Sửa ${field.name}`}
            >
              <Text style={styles.editBtnText}>✏️ Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.deleteBtn}
              accessibilityLabel={`Xoá ${field.name}`}
            >
              <Text style={styles.deleteBtnText}>🗑️ Xoá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardMaintenance: {
    borderColor: '#fed7aa',
  },
  accentBar: {
    width: 5,
  },
  accentBarActive: {
    backgroundColor: colors.primary,
  },
  accentBarMaintenance: {
    backgroundColor: colors.statusMaintenance.indicator,
  },
  innerContent: {
    flex: 1,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  fieldName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginRight: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.2,
  },
  bookingBadge: {
    backgroundColor: colors.accentBlue.bg,
    borderWidth: 1,
    borderColor: colors.accentBlue.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.full,
  },
  bookingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue.text,
  },
  emptyBookingBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.full,
  },
  emptyBookingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md - 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    marginRight: spacing.xxs,
  },
  arrowIcon: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md - 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deleteBtn: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md - 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
});

export default FieldCard;
