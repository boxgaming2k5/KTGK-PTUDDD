/**
 * Định nghĩa các kiểu dữ liệu cốt lõi của ứng dụng Quản lý Sân bóng
 */

export type FieldType = '5 người' | '7 người';
export type FieldStatus = 'Hoạt động' | 'Bảo trì';

export interface FootballField {
  id: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
  status: FieldStatus;
}

export interface Booking {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string; // dd/mm/yyyy
  startHour: number; // 6 to 22
  hours: number; // 1 to 3
}

export interface NewBookingData {
  fieldId: string;
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
}

export type RootStackParamList = {
  FieldList: undefined;
  FieldDetail: { fieldId: string };
  FieldForm: { field?: FootballField };
};

