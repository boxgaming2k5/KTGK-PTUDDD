import { Booking, FootballField } from '../types';

/**
 * Kiểm tra tên sân hợp lệ và không trùng lặp
 */
export function validateFieldName(
  name: string,
  fields: FootballField[],
  currentFieldId?: string
): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Tên sân không được để trống' };
  }

  const isDuplicate = fields.some(
    (field) =>
      field.id !== currentFieldId &&
      field.name.trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return { isValid: false, error: 'Tên sân này đã tồn tại, vui lòng chọn tên khác' };
  }

  return { isValid: true };
}

/**
 * Kiểm tra giá thuê mỗi giờ (> 0)
 */
export function validatePricePerHour(priceText: string | number): {
  isValid: boolean;
  error?: string;
  value?: number;
} {
  const num = typeof priceText === 'number' ? priceText : Number(priceText.toString().replace(/[.,\s]/g, ''));
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Giá thuê phải là số lớn hơn 0' };
  }
  return { isValid: true, value: num };
}

/**
 * Kiểm tra tên khách hàng
 */
export function validateCustomerName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Tên khách hàng không được để trống' };
  }
  return { isValid: true };
}

/**
 * Kiểm tra số điện thoại: 10 chữ số, bắt đầu bằng 0
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = phone.trim();
  const phoneRegex = /^0\d{9}$/;
  if (!trimmed) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  if (!phoneRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0912345678)',
    };
  }
  return { isValid: true };
}

/**
 * Kiểm tra định dạng ngày dd/mm/yyyy
 */
export function validateDateFormat(dateStr: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Ngày đặt sân không được để trống' };
  }

  // Regex dd/mm/yyyy
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = trimmed.match(dateRegex);
  if (!match) {
    return {
      isValid: false,
      error: 'Định dạng ngày phải là dd/mm/yyyy (VD: 28/10/2026)',
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Tháng không hợp lệ (từ 01 đến 12)' };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: `Ngày không hợp lệ trong tháng ${month}` };
  }

  return { isValid: true };
}

/**
 * Kiểm tra khung giờ: startHour từ 6 đến 22, hours từ 1 đến 3, startHour + hours <= 23
 */
export function validateBookingHours(
  startHour: number,
  hours: number
): { isValid: boolean; error?: string } {
  if (isNaN(startHour) || startHour < 6 || startHour > 22) {
    return {
      isValid: false,
      error: 'Giờ bắt đầu phải từ 6 đến 22 (từ 6h sáng đến 22h tối)',
    };
  }

  if (isNaN(hours) || hours < 1 || hours > 3) {
    return {
      isValid: false,
      error: 'Số giờ thuê phải từ 1 đến 3 giờ',
    };
  }

  const endHour = startHour + hours;
  if (endHour > 23) {
    return {
      isValid: false,
      error: `Giờ kết thúc (${endHour}h) không được quá 23h. Sân đóng cửa lúc 23h00!`,
    };
  }

  return { isValid: true };
}

/**
 * Kiểm tra xem 2 khoảng thời gian [startA, startA + hoursA] và [startB, startB + hoursB] có giao nhau không
 * Giao nhau khi max(startA, startB) < min(endA, endB)
 */
export function isTimeOverlapping(
  startA: number,
  hoursA: number,
  startB: number,
  hoursB: number
): boolean {
  const endA = startA + hoursA;
  const endB = startB + hoursB;
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Kiểm tra trùng lịch đặt sân theo Câu 5:
 * Không cho đặt trùng lịch: cùng sân, cùng ngày và khung giờ giao nhau với lượt đặt đã có.
 */
export function findConflictingBooking(
  bookings: Booking[],
  fieldId: string,
  date: string,
  startHour: number,
  hours: number,
  excludeBookingId?: string
): Booking | undefined {
  const normalizedDate = date.trim();

  return bookings.find((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.fieldId !== fieldId) return false;
    if (b.date.trim() !== normalizedDate) return false;

    return isTimeOverlapping(b.startHour, b.hours, startHour, hours);
  });
}

