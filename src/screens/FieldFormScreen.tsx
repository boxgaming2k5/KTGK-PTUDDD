import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, FieldType, FieldStatus } from '../types';
import { useFootball } from '../context/FootballContext';
import { colors, spacing, borderRadius, shadows } from '../theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { validateFieldName, validatePricePerHour } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;

export const FieldFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { addField, updateField, fields } = useFootball();

  // Xác định chế độ Thêm mới hay Chỉnh sửa (Câu 2)
  const editingField = route.params?.field;
  const isEditing = Boolean(editingField);

  // Điền sẵn dữ liệu cũ khi sửa (Câu 2)
  const [name, setName] = useState(editingField ? editingField.name : '');
  const [type, setType] = useState<FieldType>(
    editingField ? editingField.type : '5 người'
  );
  const [pricePerHour, setPricePerHour] = useState(
    editingField ? String(editingField.pricePerHour) : ''
  );
  const [status, setStatus] = useState<FieldStatus>(
    editingField ? editingField.status : 'Hoạt động'
  );

  const [errors, setErrors] = useState<{ name?: string; pricePerHour?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Chỉnh Sửa Sân' : 'Thêm Sân Mới',
    });
  }, [navigation, isEditing]);

  const handleSubmit = async () => {
    const newErrors: { name?: string; pricePerHour?: string } = {};

    // 1. Kiểm tra tên không trống và không trùng tên sân khác (Câu 2)
    const nameVal = validateFieldName(name, fields, editingField?.id);
    if (!nameVal.isValid) {
      newErrors.name = nameVal.error;
    }

    // 2. Kiểm tra giá thuê là số > 0 (Câu 2)
    const priceVal = validatePricePerHour(pricePerHour);
    if (!priceVal.isValid) {
      newErrors.pricePerHour = priceVal.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && editingField) {
        const res = await updateField({
          id: editingField.id,
          name: name.trim(),
          type,
          pricePerHour: priceVal.value!,
          status,
        });

        if (!res.success) {
          Alert.alert('Lỗi cập nhật', res.error || 'Không thể cập nhật sân');
          return;
        }

        Alert.alert('Thành công 🎉', 'Thông tin sân bóng đã được cập nhật!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const res = await addField({
          name: name.trim(),
          type,
          pricePerHour: priceVal.value!,
          status,
        });

        if (!res.success) {
          Alert.alert('Lỗi tạo sân', res.error || 'Không thể tạo sân mới');
          return;
        }

        Alert.alert('Thành công 🎉', 'Đã thêm sân bóng mới vào danh sách!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi hệ thống', err?.message || 'Đã xảy ra sự cố');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.huge },
        ]}
      >
        {/* Banner hướng dẫn trên đầu */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>{isEditing ? '📝' : '✨'}</Text>
          <View style={styles.introTextGroup}>
            <Text style={styles.introTitle}>
              {isEditing ? `Cập nhật: ${editingField?.name}` : 'Tạo sân bóng mới'}
            </Text>
            <Text style={styles.introDesc}>
              Điền thông tin và lựa chọn loại sân cùng trạng thái phù hợp.
            </Text>
          </View>
        </View>

        {/* Khối 1: Thông tin cơ bản */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>THÔNG TIN CƠ BẢN</Text>

          {/* Ô nhập Tên sân (Câu 2) */}
          <CustomInput
            label="Tên sân"
            required
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="VD: Sân A1, Sân B2..."
            error={errors.name}
            autoCapitalize="sentences"
            helperText="Tên sân không được trùng với các sân đã có trong cụm."
          />

          {/* Chọn loại sân bằng nút bấm (Câu 2) */}
          <View style={styles.buttonGroupSection}>
            <Text style={styles.groupLabel}>
              Loại sân bóng <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.toggleRow}>
              {(['5 người', '7 người'] as FieldType[]).map((t) => {
                const isSelected = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.75}
                    onPress={() => setType(t)}
                    style={[
                      styles.toggleBtn,
                      isSelected && styles.toggleBtnActive,
                    ]}
                  >
                    <Text style={styles.toggleBtnIcon}>
                      {t === '5 người' ? '⚽' : '🏟️'}
                    </Text>
                    <Text
                      style={[
                        styles.toggleBtnText,
                        isSelected && styles.toggleBtnTextActive,
                      ]}
                    >
                      Sân {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Khối 2: Chi phí & Trạng thái */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>CHI PHÍ & KHAI THÁC</Text>

          {/* Ô nhập Giá thuê mỗi giờ (Câu 2) */}
          <CustomInput
            label="Giá thuê mỗi giờ (VNĐ)"
            required
            value={pricePerHour}
            onChangeText={(text) => {
              setPricePerHour(text);
              if (errors.pricePerHour) {
                setErrors((prev) => ({ ...prev, pricePerHour: undefined }));
              }
            }}
            placeholder="VD: 300000"
            keyboardType="numeric"
            error={errors.pricePerHour}
            suffix="đ/giờ"
            helperText="Đơn giá áp dụng cho mỗi 1 giờ thi đấu."
          />

          {/* Chọn trạng thái bằng nút bấm (Câu 2) */}
          <View style={styles.buttonGroupSection}>
            <Text style={styles.groupLabel}>
              Trạng thái khai thác <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.toggleRow}>
              {(['Hoạt động', 'Bảo trì'] as FieldStatus[]).map((st) => {
                const isSelected = status === st;
                const isAct = st === 'Hoạt động';

                return (
                  <TouchableOpacity
                    key={st}
                    activeOpacity={0.75}
                    onPress={() => setStatus(st)}
                    style={[
                      styles.toggleBtn,
                      isSelected &&
                        (isAct
                          ? styles.statusActiveBtn
                          : styles.statusMaintenanceBtn),
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isAct
                            ? colors.statusActive.indicator
                            : colors.statusMaintenance.indicator,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.toggleBtnText,
                        isSelected &&
                          (isAct
                            ? styles.statusActiveText
                            : styles.statusMaintenanceText),
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Nút Submit chính */}
        <View style={styles.submitContainer}>
          <CustomButton
            title={isEditing ? 'Lưu thay đổi' : 'Tạo sân mới'}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  introIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  introTextGroup: {
    flex: 1,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  introDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },
  buttonGroupSection: {
    marginTop: spacing.xs,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  requiredMark: {
    color: colors.error,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  toggleBtnIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.primaryDark,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs + 2,
  },
  statusActiveBtn: {
    backgroundColor: colors.statusActive.bg,
    borderColor: colors.statusActive.border,
  },
  statusActiveText: {
    color: colors.statusActive.text,
  },
  statusMaintenanceBtn: {
    backgroundColor: colors.statusMaintenance.bg,
    borderColor: colors.statusMaintenance.border,
  },
  statusMaintenanceText: {
    color: colors.statusMaintenance.text,
  },
  submitContainer: {
    marginTop: spacing.sm,
  },
});

export default FieldFormScreen;
