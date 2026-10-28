/**
 * Hệ thống bảng màu chuẩn mực và hiện đại của ứng dụng Quản lý Sân bóng
 * Thiết kế theo chuẩn giao diện thể thao cao cấp (Emerald & Slate Palette)
 */

export const colors = {
  // Thương hiệu chính (Sân cỏ / Emerald Sport)
  primary: '#059669', // Emerald 600
  primaryDark: '#047857', // Emerald 700
  primaryLight: '#10b981', // Emerald 500
  primaryLighter: '#34d399', // Emerald 400
  primarySurface: '#ecfdf5', // Emerald 50
  primaryBorder: '#a7f3d0', // Emerald 200

  // Thứ cấp & Tông tối (Slate Dark)
  secondary: '#0f172a', // Slate 900
  secondaryLight: '#1e293b', // Slate 800
  secondaryMuted: '#334155', // Slate 700

  // Trạng thái theo yêu cầu đề bài: Xanh cho Hoạt động, Cam cho Bảo trì
  statusActive: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#a7f3d0',
    indicator: '#10b981',
    accent: '#d1fae5',
  },
  statusMaintenance: {
    bg: '#fff7ed',
    text: '#9a3412',
    border: '#fed7aa',
    indicator: '#f97316',
    accent: '#ffedd5',
  },

  // Màu cảnh báo & Lỗi (validation, xoá)
  error: '#dc2626',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#b91c1c',

  // Nền và Card (Layering)
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  cardAlt: '#f1f5f9', // Slate 100
  cardHover: '#f8fafc',

  // Màu văn bản (Typography)
  textPrimary: '#0f172a', // Slate 900 - cực kỳ sắc nét
  textSecondary: '#475569', // Slate 600 - thông tin phụ
  textMuted: '#94a3b8', // Slate 400 - chú thích / placeholder
  textWhite: '#ffffff',

  // Viền & Phân cách (Borders & Dividers)
  border: '#e2e8f0', // Slate 200
  borderDark: '#cbd5e1', // Slate 300
  borderLight: '#f1f5f9',

  // Vô hiệu hóa (Disabled state)
  disabledBg: '#f1f5f9',
  disabledText: '#94a3b8',
  disabledBorder: '#e2e8f0',

  // Đổ bóng (Shadow)
  shadow: '#0f172a',

  // Điểm nhấn phụ (Blue tag, v.v.)
  accentBlue: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
  },
};

export default colors;
