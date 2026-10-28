import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Booking } from '../types';
import { useFootball } from '../context/FootballContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { formatCurrencyPerHour, formatCurrency } from '../utils/formatters';
import Badge from '../components/Badge';
import CustomButton from '../components/CustomButton';
import BookingCard from '../components/BookingCard';
import BookingModal from '../components/BookingModal';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

export const FieldDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { fieldId } = route.params;
  const { getFieldById, getBookingsByFieldId, addBooking, cancelBooking } =
    useFootball();

  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);

  const field = getFieldById(fieldId);
  const bookings = getBookingsByFieldId(fieldId);

  if (!field) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin sân bóng này.</Text>
        <CustomButton
          title="Quay lại danh sách"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.backBtn}
        />
      </View>
    );
  }

  const isUnderMaintenance = field.status === 'Bảo trì';

  // Tính tổng doanh thu dự kiến của sân
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + b.hours * field.pricePerHour,
    0
  );

  /**
   * Huỷ lượt đặt sân có hỏi xác nhận bằng Alert (Câu 5)
   */
  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Xác nhận huỷ đặt sân',
      `Bạn có chắc chắn muốn huỷ lượt đặt của khách "${booking.customerName}" vào ngày ${booking.date} (${booking.startHour}h - ${booking.startHour + booking.hours}h) không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xác nhận huỷ',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelBooking(booking.id);
            if (!res.success) {
              Alert.alert('Lỗi', res.error || 'Không thể huỷ lượt đặt lúc này');
            } else {
              Alert.alert('Thành công', 'Đã huỷ lượt đặt sân thành công!');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.huge },
        ]}
      >
        {/* THẺ HERO THÔNG TIN SÂN (Câu 4) */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.titleArea}>
              <Text style={styles.fieldName}>{field.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {field.type === '5 người' ? '⚽ Sân 5 người' : '🏟️ Sân 7 người'}
                </Text>
              </View>
            </View>
            <Badge status={field.status} />
          </View>

          {/* Grid số liệu thống kê 3 cột khoa học */}
          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>GIÁ THUÊ</Text>
              <Text style={styles.statValueHighlight}>
                {formatCurrencyPerHour(field.pricePerHour)}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>LƯỢT ĐẶT</Text>
              <Text style={styles.statValue}>{bookings.length}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>DOANH THU</Text>
              <Text style={styles.statValueGreen}>
                {formatCurrency(totalRevenue)}
              </Text>
            </View>
          </View>

          {/* Cảnh báo bảo trì nếu có (Câu 4) */}
          {isUnderMaintenance && (
            <View style={styles.maintenanceNotice}>
              <Text style={styles.maintenanceIcon}>⚠️</Text>
              <View style={styles.maintenanceTextWrapper}>
                <Text style={styles.maintenanceTitle}>Sân đang bảo trì</Text>
                <Text style={styles.maintenanceDesc}>
                  Tính năng nhận lịch đặt cho sân này tạm thời bị vô hiệu hoá.
                </Text>
              </View>
            </View>
          )}

          {/* Hàng nút thao tác chính (Câu 4: Nút bị vô hiệu hoá khi bảo trì) */}
          <View style={styles.actionButtonGroup}>
            <CustomButton
              title={
                isUnderMaintenance
                  ? '🔒 Sân đang bảo trì'
                  : '⚽ Đặt sân ngay'
              }
              variant="primary"
              size="md"
              disabled={isUnderMaintenance}
              onPress={() => setIsBookingModalVisible(true)}
              style={styles.bookButton}
            />

            <CustomButton
              title="✏️ Sửa"
              variant="outline"
              size="md"
              onPress={() => navigation.navigate('FieldForm', { field })}
              style={styles.editButton}
            />
          </View>
        </View>

        {/* PHẦN DANH SÁCH CÁC LƯỢT ĐẶT CỦA SÂN (Câu 4) */}
        <View style={styles.bookingsContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              Lịch Đặt Của Sân ({bookings.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              {bookings.length > 0 ? 'Sắp xếp theo thứ tự' : 'Trống lịch'}
            </Text>
          </View>

          {bookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Chưa có lượt đặt nào"
              description={
                isUnderMaintenance
                  ? 'Sân đang bảo trì nên hiện chưa thể tiếp nhận lịch đặt nào.'
                  : 'Sân hiện đang trống toàn bộ khung giờ! Nhấn nút "Đặt sân ngay" phía trên để tạo lịch đặt.'
              }
              actionText={isUnderMaintenance ? undefined : '⚽ Đặt sân ngay'}
              onAction={
                isUnderMaintenance
                  ? undefined
                  : () => setIsBookingModalVisible(true)
              }
            />
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                pricePerHour={field.pricePerHour}
                onCancel={handleCancelBooking}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal đặt sân (Câu 4 & Câu 5) */}
      <BookingModal
        visible={isBookingModalVisible}
        field={field}
        onClose={() => setIsBookingModalVisible(false)}
        onSubmit={addBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.md,
  },
  backBtn: {
    minWidth: 160,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.sm,
  },
  fieldName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderDark,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statValueGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  maintenanceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusMaintenance.bg,
    borderWidth: 1,
    borderColor: colors.statusMaintenance.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  maintenanceIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  maintenanceTextWrapper: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.statusMaintenance.text,
  },
  maintenanceDesc: {
    fontSize: 12,
    color: colors.statusMaintenance.text,
    marginTop: 1,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButton: {
    flex: 3,
    marginRight: spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  bookingsContainer: {
    marginTop: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default FieldDetailScreen;
