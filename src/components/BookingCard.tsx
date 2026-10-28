import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Booking } from '../types';
import { formatCurrency, formatTimeSlot } from '../utils/formatters';

interface BookingCardProps {
  booking: Booking;
  pricePerHour: number;
  onCancel: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  pricePerHour,
  onCancel,
}) => {
  const totalPrice = pricePerHour * booking.hours;

  return (
    <View style={styles.card}>
      {/* Header vé đặt: Avatar, Tên khách & Nút Huỷ */}
      <View style={styles.headerRow}>
        <View style={styles.customerRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {booking.customerName.trim().charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{booking.customerName}</Text>
            <Text style={styles.phoneText}>📞 {booking.phone}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onCancel(booking)}
          style={styles.cancelBtn}
          accessibilityLabel={`Huỷ lượt đặt của ${booking.customerName}`}
        >
          <Text style={styles.cancelBtnText}>Huỷ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ticketDivider}>
        <View style={styles.ticketNotchLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.ticketNotchRight} />
      </View>

      {/* Chi tiết lịch đặt: Ngày & Giờ */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>NGÀY ĐẶT</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>📅 {booking.date}</Text>
          </View>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>KHUNG GIỜ</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              ⏰ {formatTimeSlot(booking.startHour, booking.hours)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer thành tiền */}
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Thành tiền ({booking.hours}h):</Text>
          <Text style={styles.priceFormula}>
            {formatCurrency(pricePerHour)} × {booking.hours}
          </Text>
        </View>
        <Text style={styles.priceValue}>{formatCurrency(totalPrice)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  phoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.xxs,
  },
  cancelBtn: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    position: 'relative',
  },
  ticketNotchLeft: {
    width: 10,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.background,
    marginLeft: -spacing.lg - 1,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.border,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
    marginHorizontal: spacing.xs,
  },
  ticketNotchRight: {
    width: 10,
    height: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.background,
    marginRight: -spacing.lg - 1,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...typography.captionMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  dateBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  priceFormula: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.2,
  },
});

export default BookingCard;
