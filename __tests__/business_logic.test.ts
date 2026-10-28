import {
  formatCurrencyPerHour,
  formatCurrency,
  formatTimeSlot,
} from '../src/utils/formatters';
import {
  validateFieldName,
  validatePricePerHour,
  validateCustomerName,
  validatePhoneNumber,
  validateDateFormat,
  validateBookingHours,
  isTimeOverlapping,
  findConflictingBooking,
} from '../src/utils/validation';
import { FootballField, Booking } from '../src/types';

describe('Kiểm thử nghiệp vụ Quản lý Sân bóng (20-year Senior Engineer Standard)', () => {
  describe('1. Định dạng dữ liệu (Formatters)', () => {
    test('Định dạng giá thuê: 300.000 đ/giờ', () => {
      expect(formatCurrencyPerHour(300000)).toBe('300.000 đ/giờ');
      expect(formatCurrencyPerHour(500000)).toBe('500.000 đ/giờ');
      expect(formatCurrencyPerHour(1250000)).toBe('1.250.000 đ/giờ');
    });

    test('Định dạng thành tiền: 600.000 đ', () => {
      expect(formatCurrency(600000)).toBe('600.000 đ');
      expect(formatCurrency(0)).toBe('0 đ');
    });

    test('Định dạng khung giờ', () => {
      expect(formatTimeSlot(17, 2)).toBe('17:00 - 19:00 (2 giờ)');
      expect(formatTimeSlot(8, 1)).toBe('08:00 - 09:00 (1 giờ)');
    });
  });

  describe('2. Kiểm tra dữ liệu Sân bóng (Câu 2)', () => {
    const existingFields: FootballField[] = [
      {
        id: 'f1',
        name: 'Sân A1',
        type: '5 người',
        pricePerHour: 300000,
        status: 'Hoạt động',
      },
      {
        id: 'f2',
        name: 'Sân B1',
        type: '7 người',
        pricePerHour: 500000,
        status: 'Hoạt động',
      },
    ];

    test('Tên sân không được để trống', () => {
      expect(validateFieldName('', existingFields).isValid).toBe(false);
      expect(validateFieldName('   ', existingFields).isValid).toBe(false);
    });

    test('Không trùng tên sân khác', () => {
      expect(validateFieldName('Sân A1', existingFields).isValid).toBe(false);
      expect(validateFieldName('sân a1', existingFields).isValid).toBe(false);
      expect(validateFieldName('Sân C1', existingFields).isValid).toBe(true);
    });

    test('Khi sửa, được phép giữ nguyên tên của chính sân đó', () => {
      expect(validateFieldName('Sân A1', existingFields, 'f1').isValid).toBe(true);
      expect(validateFieldName('Sân B1', existingFields, 'f1').isValid).toBe(false);
    });

    test('Giá thuê phải là số > 0', () => {
      expect(validatePricePerHour('0').isValid).toBe(false);
      expect(validatePricePerHour('-100000').isValid).toBe(false);
      expect(validatePricePerHour('abc').isValid).toBe(false);
      expect(validatePricePerHour('300000').isValid).toBe(true);
      expect(validatePricePerHour(300000).isValid).toBe(true);
    });
  });

  describe('3. Kiểm tra dữ liệu Đặt sân (Câu 4, Câu 5)', () => {
    test('Tên khách hàng không được để trống', () => {
      expect(validateCustomerName('').isValid).toBe(false);
      expect(validateCustomerName('   ').isValid).toBe(false);
      expect(validateCustomerName('Nguyễn Văn A').isValid).toBe(true);
    });

    test('Số điện thoại: 10 chữ số, bắt đầu bằng 0', () => {
      expect(validatePhoneNumber('0912345678').isValid).toBe(true);
      expect(validatePhoneNumber('0387654321').isValid).toBe(true);
      // Không bắt đầu bằng 0
      expect(validatePhoneNumber('1912345678').isValid).toBe(false);
      // Dưới 10 chữ số
      expect(validatePhoneNumber('091234567').isValid).toBe(false);
      // Trên 10 chữ số
      expect(validatePhoneNumber('09123456789').isValid).toBe(false);
      // Có chứa ký tự chữ
      expect(validatePhoneNumber('091234567a').isValid).toBe(false);
    });

    test('Ngày định dạng dd/mm/yyyy', () => {
      expect(validateDateFormat('28/10/2026').isValid).toBe(true);
      expect(validateDateFormat('31/12/2026').isValid).toBe(true);
      expect(validateDateFormat('2026-10-28').isValid).toBe(false);
      expect(validateDateFormat('32/01/2026').isValid).toBe(false);
      expect(validateDateFormat('28/13/2026').isValid).toBe(false);
    });

    test('Khung giờ: startHour từ 6 đến 22, hours từ 1 đến 3, giờ kết thúc <= 23h', () => {
      // Hợp lệ
      expect(validateBookingHours(6, 2).isValid).toBe(true);
      expect(validateBookingHours(17, 2).isValid).toBe(true);
      expect(validateBookingHours(20, 3).isValid).toBe(true); // 20 + 3 = 23 (hợp lệ)

      // startHour < 6
      expect(validateBookingHours(5, 2).isValid).toBe(false);
      // startHour > 22
      expect(validateBookingHours(23, 1).isValid).toBe(false);

      // hours < 1 hoặc > 3
      expect(validateBookingHours(10, 0).isValid).toBe(false);
      expect(validateBookingHours(10, 4).isValid).toBe(false);

      // startHour + hours > 23 (Quá 23h)
      expect(validateBookingHours(21, 3).isValid).toBe(false); // 21 + 3 = 24 > 23
      expect(validateBookingHours(22, 2).isValid).toBe(false); // 22 + 2 = 24 > 23
    });
  });

  describe('4. Kiểm tra trùng lịch (Câu 5 - Trọng tâm đề bài)', () => {
    test('Công thức giao nhau khung giờ: isTimeOverlapping', () => {
      // Đã có: 17h-19h
      // Đặt: 18h-20h -> GIAO NHAU (trùng)
      expect(isTimeOverlapping(17, 2, 18, 2)).toBe(true);

      // Đã có: 17h-19h
      // Đặt: 19h-20h -> KHÔNG GIAO NHAU (cho phép)
      expect(isTimeOverlapping(17, 2, 19, 1)).toBe(false);

      // Đã có: 17h-19h
      // Đặt: 16h-17h -> KHÔNG GIAO NHAU (cho phép)
      expect(isTimeOverlapping(17, 2, 16, 1)).toBe(false);

      // Đã có: 17h-19h
      // Đặt: 17h-18h -> GIAO NHAU (trùng)
      expect(isTimeOverlapping(17, 2, 17, 1)).toBe(true);
    });

    test('findConflictingBooking: cùng sân, cùng ngày, khung giờ giao nhau', () => {
      const bookings: Booking[] = [
        {
          id: 'b1',
          fieldId: 'f1',
          customerName: 'Nguyễn Văn Nam',
          phone: '0912345678',
          date: '28/10/2026',
          startHour: 17,
          hours: 2, // 17h - 19h
        },
      ];

      // Đặt cùng sân f1, cùng ngày 28/10/2026, lúc 18h-20h -> PHÁT HIỆN TRÙNG
      const conflict1 = findConflictingBooking(
        bookings,
        'f1',
        '28/10/2026',
        18,
        2
      );
      expect(conflict1).toBeDefined();
      expect(conflict1?.customerName).toBe('Nguyễn Văn Nam');

      // Đặt cùng sân f1, cùng ngày 28/10/2026, lúc 19h-20h -> KHÔNG TRÙNG
      const conflict2 = findConflictingBooking(
        bookings,
        'f1',
        '28/10/2026',
        19,
        1
      );
      expect(conflict2).toBeUndefined();

      // Đặt sân khác f2 cùng ngày và giờ -> KHÔNG TRÙNG
      const conflict3 = findConflictingBooking(
        bookings,
        'f2',
        '28/10/2026',
        18,
        2
      );
      expect(conflict3).toBeUndefined();

      // Đặt cùng sân f1 nhưng khác ngày -> KHÔNG TRÙNG
      const conflict4 = findConflictingBooking(
        bookings,
        'f1',
        '29/10/2026',
        18,
        2
      );
      expect(conflict4).toBeUndefined();
    });
  });
});

