import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { FootballField, NewBookingData } from '../types';
import { formatCurrency } from '../utils/formatters';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import {
  validateCustomerName,
  validatePhoneNumber,
  validateDateFormat,
  validateBookingHours,
} from '../utils/validation';

interface BookingModalProps {
  visible: boolean;
  field: FootballField;
  onClose: () => void;
  onSubmit: (data: NewBookingData) => Promise<{ success: boolean; error?: string }>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  field,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [startHourText, setStartHourText] = useState('17');
  const [hoursText, setHoursText] = useState('2');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo ngày hôm nay làm mặc định dd/mm/yyyy
  useEffect(() => {
    if (visible) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setDate(`${dd}/${mm}/${yyyy}`);
      setCustomerName('');
      setPhone('');
      setStartHourText('17');
      setHoursText('2');
      setErrors({});
    }
  }, [visible]);

  // Tính thành tiền thời gian thực ngay khi nhập/chọn số giờ (Câu 4)
  const parsedHours = parseInt(hoursText, 10);
  const validHours = !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 0;
  const totalPrice = field.pricePerHour * validHours;

  const parsedStartHour = parseInt(startHourText, 10);
  const endHour = !isNaN(parsedStartHour) && !isNaN(parsedHours) ? parsedStartHour + parsedHours : 0;
  const isOverTime = endHour > 23;

  const handleHourSelect = (h: number) => {
    setHoursText(String(h));
    if (errors.hours) {
      setErrors((prev) => ({ ...prev, hours: '' }));
    }
  };

  const handleQuickStartHour = (h: number) => {
    setStartHourText(String(h));
    if (errors.hours) {
      setErrors((prev) => ({ ...prev, hours: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // 1. Tên khách hàng (bắt buộc)
    const nameVal = validateCustomerName(customerName);
    if (!nameVal.isValid) {
      newErrors.customerName = nameVal.error!;
    }

    // 2. Số điện thoại (10 chữ số, bắt đầu bằng 0)
    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.isValid) {
      newErrors.phone = phoneVal.error!;
    }

    // 3. Ngày đặt (dd/mm/yyyy)
    const dateVal = validateDateFormat(date);
    if (!dateVal.isValid) {
      newErrors.date = dateVal.error!;
    }

    // 4. Khung giờ (startHour 6-22, hours 1-3, <= 23h)
    const sHour = parseInt(startHourText, 10);
    const hrs = parseInt(hoursText, 10);
    const hoursVal = validateBookingHours(sHour, hrs);
    if (!hoursVal.isValid) {
      newErrors.hours = hoursVal.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmit({
        fieldId: field.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        date: date.trim(),
        startHour: sHour,
        hours: hrs,
      });

      if (!res.success) {
        Alert.alert('Không thể đặt sân', res.error || 'Có lỗi xảy ra khi đặt sân.');
      } else {
        Alert.alert(
          'Đặt sân thành công 🎉',
          `Sân: ${field.name}\nKhách hàng: ${customerName.trim()}\nKhung giờ: ${sHour}h00 - ${sHour + hrs}h00\nNgày: ${date.trim()}\nThành tiền: ${formatCurrency(totalPrice)}`,
          [{ text: 'Đóng', onPress: onClose }]
        );
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể đặt sân lúc này');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Handle bar phong cách Bottom Sheet */}
          <View style={styles.handleBar} />

          {/* Header Modal */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Đặt sân: {field.name}</Text>
              <Text style={styles.subtitle}>
                {field.type} • Đơn giá: {formatCurrency(field.pricePerHour)}/giờ
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Đóng modal"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form nội dung cuộn mượt mà */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Tên khách */}
            <CustomInput
              label="Tên khách hàng"
              required
              value={customerName}
              onChangeText={(text) => {
                setCustomerName(text);
                if (errors.customerName) {
                  setErrors((prev) => ({ ...prev, customerName: '' }));
                }
              }}
              placeholder="VD: Nguyễn Văn Nam"
              error={errors.customerName}
              autoCapitalize="words"
            />

            {/* Số điện thoại */}
            <CustomInput
              label="Số điện thoại"
              required
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: '' }));
                }
              }}
              placeholder="10 chữ số, bắt đầu bằng 0 (VD: 0912345678)"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            {/* Ngày đặt */}
            <CustomInput
              label="Ngày đặt sân (dd/mm/yyyy)"
              required
              value={date}
              onChangeText={(text) => {
                setDate(text);
                if (errors.date) {
                  setErrors((prev) => ({ ...prev, date: '' }));
                }
              }}
              placeholder="dd/mm/yyyy (VD: 28/10/2026)"
              keyboardType="numeric"
              error={errors.date}
            />

            {/* Khung giờ bắt đầu */}
            <View style={styles.fieldSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  Giờ bắt đầu (6h đến 22h) <Text style={styles.requiredMark}>*</Text>
                </Text>
                <Text style={styles.currentHourDisplay}>
                  {!isNaN(parsedStartHour) ? `${parsedStartHour}:00` : '--:--'}
                </Text>
              </View>

              <CustomInput
                label=""
                value={startHourText}
                onChangeText={(text) => {
                  setStartHourText(text);
                  if (errors.hours) {
                    setErrors((prev) => ({ ...prev, hours: '' }));
                  }
                }}
                placeholder="Nhập giờ bắt đầu (6 - 22)"
                keyboardType="numeric"
                maxLength={2}
                containerStyle={styles.noMarginInput}
              />

              {/* Gợi ý chọn nhanh các giờ vàng */}
              <View style={styles.quickHourRow}>
                <Text style={styles.quickLabel}>Giờ phổ biến:</Text>
                {[6, 8, 16, 17, 18, 19, 20, 21].map((h) => {
                  const isSelected = parsedStartHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      activeOpacity={0.7}
                      onPress={() => handleQuickStartHour(h)}
                      style={[
                        styles.quickChip,
                        isSelected && styles.quickChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          isSelected && styles.quickChipTextActive,
                        ]}
                      >
                        {h}h
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Số giờ thuê */}
            <View style={styles.fieldSection}>
              <Text style={styles.sectionLabel}>
                Số giờ thuê (từ 1 đến 3 giờ) <Text style={styles.requiredMark}>*</Text>
              </Text>

              <View style={styles.hourButtonsRow}>
                {[1, 2, 3].map((h) => {
                  const isSelected = parsedHours === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      activeOpacity={0.75}
                      onPress={() => handleHourSelect(h)}
                      style={[
                        styles.hourSelectBtn,
                        isSelected && styles.hourSelectBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hourSelectNumber,
                          isSelected && styles.hourSelectNumberActive,
                        ]}
                      >
                        {h}
                      </Text>
                      <Text
                        style={[
                          styles.hourSelectLabel,
                          isSelected && styles.hourSelectLabelActive,
                        ]}
                      >
                        tiếng
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {errors.hours ? (
                <Text style={styles.errorTextUnderHours}>{errors.hours}</Text>
              ) : null}
            </View>

            {/* Hộp tóm tắt khung giờ thi đấu */}
            {!isNaN(parsedStartHour) && parsedHours > 0 && (
              <View
                style={[
                  styles.summarySlot,
                  isOverTime && styles.summarySlotDanger,
                ]}
              >
                <View style={styles.summarySlotHeader}>
                  <Text style={styles.summarySlotTitle}>
                    {isOverTime ? '⚠️ KHUNG GIỜ KHÔNG HỢP LỆ' : '⏱️ KHUNG GIỜ THI ĐẤU'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.slotBold,
                    isOverTime && styles.slotWarning,
                  ]}
                >
                  {parsedStartHour}:00 - {endHour}:00 ({parsedHours} tiếng)
                </Text>
                {isOverTime && (
                  <Text style={styles.overTimeNotice}>
                    Giờ kết thúc không được vượt quá 23h00 (Sân đóng cửa).
                  </Text>
                )}
              </View>
            )}

            {/* BẢNG TÍNH THÀNH TIỀN REALTIME (Câu 4) */}
            <View style={styles.totalPriceCard}>
              <View>
                <Text style={styles.totalPriceLabel}>THÀNH TIỀN TẠM TÍNH</Text>
                <Text style={styles.totalPriceFormula}>
                  {formatCurrency(field.pricePerHour)} × {validHours} giờ
                </Text>
              </View>
              <Text style={styles.totalPriceAmount}>
                {formatCurrency(totalPrice)}
              </Text>
            </View>

            {/* Hàng nút hành động */}
            <View style={styles.actionButtons}>
              <CustomButton
                title="Đóng"
                variant="outline"
                size="md"
                onPress={onClose}
                style={styles.cancelBtn}
              />
              <CustomButton
                title="Xác nhận đặt sân"
                variant="primary"
                size="md"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.confirmBtn}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.modal,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.huge + spacing.md,
  },
  fieldSection: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  currentHourDisplay: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  requiredMark: {
    color: colors.error,
    fontWeight: '700',
  },
  noMarginInput: {
    marginBottom: spacing.xs,
  },
  quickHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  quickLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  quickChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  quickChipActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  quickChipTextActive: {
    color: colors.primaryDark,
  },
  hourButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourSelectBtn: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  hourSelectBtnActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  hourSelectNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  hourSelectNumberActive: {
    color: colors.primaryDark,
  },
  hourSelectLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hourSelectLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  errorTextUnderHours: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  summarySlot: {
    backgroundColor: colors.primarySurface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summarySlotDanger: {
    backgroundColor: colors.errorBg,
    borderLeftColor: colors.error,
  },
  summarySlotHeader: {
    marginBottom: 2,
  },
  summarySlotTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  slotBold: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  slotWarning: {
    color: colors.error,
  },
  overTimeNotice: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    marginTop: 2,
  },
  totalPriceCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  totalPriceLabel: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalPriceFormula: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  totalPriceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  confirmBtn: {
    flex: 2,
  },
});

export default BookingModal;
