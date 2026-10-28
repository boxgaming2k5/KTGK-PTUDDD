import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, FootballField } from '../types';
import { useFootball } from '../context/FootballContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import FieldCard from '../components/FieldCard';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldList'>;
type FilterTab = 'all' | '5' | '7' | 'active';

export const FieldListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    fields,
    bookings,
    deleteField,
    isLoading,
    activeFieldsCount,
    totalFieldsCount,
  } = useFootball();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Đếm số lượt đặt theo từng sân
  const bookingCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      map[b.fieldId] = (map[b.fieldId] || 0) + 1;
    });
    return map;
  }, [bookings]);

  // Lọc danh sách sân theo tab bộ lọc
  const filteredFields = useMemo(() => {
    switch (activeTab) {
      case '5':
        return fields.filter((f) => f.type === '5 người');
      case '7':
        return fields.filter((f) => f.type === '7 người');
      case 'active':
        return fields.filter((f) => f.status === 'Hoạt động');
      case 'all':
      default:
        return fields;
    }
  }, [fields, activeTab]);

  /**
   * Xử lý xoá sân (Câu 3):
   * 1. Hỏi xác nhận trước khi xoá.
   * 2. Không cho xoá sân đang có lượt đặt, báo lỗi bằng Alert.
   */
  const handleDeleteField = (field: FootballField) => {
    const hasExistingBookings = bookings.some((b) => b.fieldId === field.id);

    if (hasExistingBookings) {
      Alert.alert(
        'Không thể xoá sân',
        `Sân "${field.name}" hiện đang có ${bookingCountMap[field.id] || 1} lượt đặt của khách hàng. Bạn không thể xoá sân đang có lịch đặt!`,
        [{ text: 'Đã hiểu', style: 'cancel' }]
      );
      return;
    }

    Alert.alert(
      'Xác nhận xoá sân',
      `Bạn có chắc chắn muốn xoá sân "${field.name}" khỏi hệ thống không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá ngay',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteField(field.id);
            if (!res.success) {
              Alert.alert('Lỗi', res.error || 'Không thể xoá sân lúc này');
            }
          },
        },
      ]
    );
  };

  /**
   * Header thống kê tổng quan theo Câu 1:
   * "Đầu màn hình hiển thị số sân đang hoạt động trên tổng số sân, ví dụ '3/4 sân hoạt động'."
   */
  const renderHeader = () => {
    const activePercent = totalFieldsCount > 0 ? (activeFieldsCount / totalFieldsCount) * 100 : 0;
    const maintenanceCount = totalFieldsCount - activeFieldsCount;

    return (
      <View style={styles.headerContainer}>
        {/* Thanh tiêu đề thương hiệu */}
        <View style={styles.brandBar}>
          <View>
            <Text style={styles.brandCategory}>HỆ THỐNG QUẢN LÝ</Text>
            <Text style={styles.brandTitle}>Cụm Sân Bóng Mini</Text>
          </View>
          <CustomButton
            title="+ Thêm sân"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('FieldForm', {})}
          />
        </View>

        {/* Thẻ KPI trạng thái sân chuẩn Câu 1: "3/4 sân hoạt động" */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeaderRow}>
            <View>
              <Text style={styles.kpiLabel}>TRẠNG THÁI KHAI THÁC</Text>
              <Text style={styles.kpiMainValue}>
                {activeFieldsCount}/{totalFieldsCount} sân hoạt động
              </Text>
            </View>
            <View style={styles.kpiBadgeContainer}>
              <Text style={styles.kpiPercentText}>{Math.round(activePercent)}%</Text>
              <Text style={styles.kpiPercentSub}>Sẵn sàng</Text>
            </View>
          </View>

          {/* Thanh tiến độ trực quan */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${activePercent}%` },
              ]}
            />
          </View>

          {/* Hai ô thông tin nhỏ */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiMiniBox}>
              <View style={[styles.kpiMiniDot, { backgroundColor: colors.statusActive.indicator }]} />
              <Text style={styles.kpiMiniLabel}>Hoạt động:</Text>
              <Text style={[styles.kpiMiniVal, { color: colors.statusActive.text }]}>
                {activeFieldsCount} sân
              </Text>
            </View>

            <View style={styles.kpiMiniBox}>
              <View style={[styles.kpiMiniDot, { backgroundColor: colors.statusMaintenance.indicator }]} />
              <Text style={styles.kpiMiniLabel}>Bảo trì:</Text>
              <Text style={[styles.kpiMiniVal, { color: colors.statusMaintenance.text }]}>
                {maintenanceCount} sân
              </Text>
            </View>
          </View>
        </View>

        {/* Thanh Tab bộ lọc khoa học */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionHeaderTitle}>Danh sách sân ({filteredFields.length})</Text>

          <View style={styles.filterTabsRow}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: '5', label: 'Sân 5' },
              { id: '7', label: 'Sân 7' },
              { id: 'active', label: 'Hoạt động' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.7}
                  onPress={() => setActiveTab(tab.id as FilterTab)}
                  style={[
                    styles.filterTab,
                    isSelected && styles.filterTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isSelected && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu cụm sân...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <FieldCard
            field={item}
            bookingCount={bookingCountMap[item.id] || 0}
            onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
            onEdit={() => navigation.navigate('FieldForm', { field: item })}
            onDelete={() => handleDeleteField(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🏟️"
            title="Không tìm thấy sân nào"
            description={
              activeTab !== 'all'
                ? 'Không có sân nào phù hợp với bộ lọc hiện tại. Thử chọn tab khác.'
                : 'Hãy nhấn nút "+ Thêm sân" ở trên để tạo sân bóng đầu tiên cho cụm sân của bạn.'
            }
            actionText={activeTab !== 'all' ? 'Xem tất cả sân' : '+ Thêm sân ngay'}
            onAction={
              activeTab !== 'all'
                ? () => setActiveTab('all')
                : () => navigation.navigate('FieldForm', {})
            }
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.huge },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodySecondary,
    marginTop: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  kpiCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kpiMainValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  kpiBadgeContainer: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  kpiPercentText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  kpiPercentSub: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  kpiMiniBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiMiniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  kpiMiniLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  kpiMiniVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  sectionHeaderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    padding: spacing.xxs + 1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  filterTabActive: {
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});

export default FieldListScreen;
