import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FootballField, Booking, NewBookingData } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { INITIAL_FIELDS, INITIAL_BOOKINGS } from '../constants/mockData';
import {
  validateFieldName,
  validatePricePerHour,
  validateCustomerName,
  validatePhoneNumber,
  validateDateFormat,
  validateBookingHours,
  findConflictingBooking,
} from '../utils/validation';
import { formatTimeSlot } from '../utils/formatters';

interface FootballContextType {
  fields: FootballField[];
  bookings: Booking[];
  isLoading: boolean;
  addField: (
    data: Omit<FootballField, 'id'>
  ) => Promise<{ success: boolean; error?: string; field?: FootballField }>;
  updateField: (
    field: FootballField
  ) => Promise<{ success: boolean; error?: string }>;
  deleteField: (
    fieldId: string
  ) => Promise<{ success: boolean; error?: string }>;
  addBooking: (
    data: NewBookingData
  ) => Promise<{ success: boolean; error?: string; booking?: Booking }>;
  cancelBooking: (
    bookingId: string
  ) => Promise<{ success: boolean; error?: string }>;
  getFieldById: (fieldId: string) => FootballField | undefined;
  getBookingsByFieldId: (fieldId: string) => Booking[];
  hasBookings: (fieldId: string) => boolean;
  activeFieldsCount: number;
  totalFieldsCount: number;
}

const FootballContext = createContext<FootballContextType | undefined>(undefined);

export const FootballProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<FootballField[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo dữ liệu khi mở app
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const isInitialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);

      if (!isInitialized) {
        // Lần đầu mở app: Khởi tạo sẵn ít nhất 4 sân và 3 lượt đặt mẫu
        await AsyncStorage.setItem(
          STORAGE_KEYS.FIELDS,
          JSON.stringify(INITIAL_FIELDS)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.BOOKINGS,
          JSON.stringify(INITIAL_BOOKINGS)
        );
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

        setFields(INITIAL_FIELDS);
        setBookings(INITIAL_BOOKINGS);
      } else {
        const storedFields = await AsyncStorage.getItem(STORAGE_KEYS.FIELDS);
        const storedBookings = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);

        setFields(storedFields ? JSON.parse(storedFields) : INITIAL_FIELDS);
        setBookings(storedBookings ? JSON.parse(storedBookings) : INITIAL_BOOKINGS);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
      // Fallback an toàn để app không bao giờ bị crash
      setFields(INITIAL_FIELDS);
      setBookings(INITIAL_BOOKINGS);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper lưu danh sách sân vào AsyncStorage
  const persistFields = async (updatedFields: FootballField[]) => {
    setFields(updatedFields);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FIELDS,
        JSON.stringify(updatedFields)
      );
    } catch (error) {
      console.error('Lỗi khi lưu danh sách sân:', error);
    }
  };

  // Helper lưu danh sách đặt sân vào AsyncStorage
  const persistBookings = async (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BOOKINGS,
        JSON.stringify(updatedBookings)
      );
    } catch (error) {
      console.error('Lỗi khi lưu danh sách lượt đặt:', error);
    }
  };

  /**
   * Thêm sân mới (Câu 2)
   */
  const addField = async (
    data: Omit<FootballField, 'id'>
  ): Promise<{ success: boolean; error?: string; field?: FootballField }> => {
    const nameVal = validateFieldName(data.name, fields);
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error };
    }

    const priceVal = validatePricePerHour(data.pricePerHour);
    if (!priceVal.isValid || priceVal.value === undefined) {
      return { success: false, error: priceVal.error };
    }

    const newField: FootballField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      type: data.type,
      pricePerHour: priceVal.value,
      status: data.status,
    };

    const updated = [newField, ...fields];
    await persistFields(updated);
    return { success: true, field: newField };
  };

  /**
   * Sửa thông tin sân (Câu 2)
   */
  const updateField = async (
    field: FootballField
  ): Promise<{ success: boolean; error?: string }> => {
    const nameVal = validateFieldName(field.name, fields, field.id);
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error };
    }

    const priceVal = validatePricePerHour(field.pricePerHour);
    if (!priceVal.isValid || priceVal.value === undefined) {
      return { success: false, error: priceVal.error };
    }

    const updated = fields.map((f) =>
      f.id === field.id
        ? {
            ...field,
            name: field.name.trim(),
            pricePerHour: priceVal.value!,
          }
        : f
    );

    await persistFields(updated);
    return { success: true };
  };

  /**
   * Xoá sân (Câu 3)
   * Yêu cầu: Không cho xoá sân đang có lượt đặt
   */
  const deleteField = async (
    fieldId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const isBooked = bookings.some((b) => b.fieldId === fieldId);
    if (isBooked) {
      return {
        success: false,
        error:
          'Không thể xoá sân này vì đang có lượt đặt. Vui lòng huỷ các lượt đặt trước!',
      };
    }

    const updated = fields.filter((f) => f.id !== fieldId);
    await persistFields(updated);
    return { success: true };
  };

  /**
   * Thêm lượt đặt sân (Câu 4, Câu 5)
   * Nghiệp vụ: Sân bảo trì không thể đặt, check format, check trùng lịch
   */
  const addBooking = async (
    data: NewBookingData
  ): Promise<{ success: boolean; error?: string; booking?: Booking }> => {
    const targetField = fields.find((f) => f.id === data.fieldId);
    if (!targetField) {
      return { success: false, error: 'Không tìm thấy sân được chọn' };
    }

    // Kiểm tra trạng thái sân: Không cho đặt sân đang bảo trì
    if (targetField.status === 'Bảo trì') {
      return {
        success: false,
        error: 'Sân đang trong trạng thái Bảo trì, không thể đặt sân lúc này!',
      };
    }

    // Kiểm tra tên khách hàng
    const nameVal = validateCustomerName(data.customerName);
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error };
    }

    // Kiểm tra số điện thoại: 10 chữ số, bắt đầu bằng 0
    const phoneVal = validatePhoneNumber(data.phone);
    if (!phoneVal.isValid) {
      return { success: false, error: phoneVal.error };
    }

    // Kiểm tra định dạng ngày
    const dateVal = validateDateFormat(data.date);
    if (!dateVal.isValid) {
      return { success: false, error: dateVal.error };
    }

    // Kiểm tra khung giờ và giờ kết thúc <= 23h
    const hoursVal = validateBookingHours(data.startHour, data.hours);
    if (!hoursVal.isValid) {
      return { success: false, error: hoursVal.error };
    }

    // Kiểm tra trùng lịch (Câu 5)
    const conflict = findConflictingBooking(
      bookings,
      data.fieldId,
      data.date,
      data.startHour,
      data.hours
    );

    if (conflict) {
      const conflictSlot = formatTimeSlot(conflict.startHour, conflict.hours);
      return {
        success: false,
        error: `Trùng lịch! Khung giờ này bị giao nhau với lịch đặt của khách "${conflict.customerName}" (${conflictSlot}) ngày ${conflict.date}.`,
      };
    }

    const newBooking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldId: data.fieldId,
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      date: data.date.trim(),
      startHour: data.startHour,
      hours: data.hours,
    };

    const updated = [newBooking, ...bookings];
    await persistBookings(updated);
    return { success: true, booking: newBooking };
  };

  /**
   * Huỷ một lượt đặt (Câu 5)
   */
  const cancelBooking = async (
    bookingId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    await persistBookings(updated);
    return { success: true };
  };

  const getFieldById = useCallback(
    (fieldId: string) => fields.find((f) => f.id === fieldId),
    [fields]
  );

  const getBookingsByFieldId = useCallback(
    (fieldId: string) => bookings.filter((b) => b.fieldId === fieldId),
    [bookings]
  );

  const hasBookings = useCallback(
    (fieldId: string) => bookings.some((b) => b.fieldId === fieldId),
    [bookings]
  );

  const activeFieldsCount = fields.filter((f) => f.status === 'Hoạt động').length;
  const totalFieldsCount = fields.length;

  return (
    <FootballContext.Provider
      value={{
        fields,
        bookings,
        isLoading,
        addField,
        updateField,
        deleteField,
        addBooking,
        cancelBooking,
        getFieldById,
        getBookingsByFieldId,
        hasBookings,
        activeFieldsCount,
        totalFieldsCount,
      }}
    >
      {children}
    </FootballContext.Provider>
  );
};

export const useFootball = (): FootballContextType => {
  const context = useContext(FootballContext);
  if (!context) {
    throw new Error('useFootball must be used within a FootballProvider');
  }
  return context;
};

