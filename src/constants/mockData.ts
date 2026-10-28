import { FootballField, Booking } from '../types';

export const INITIAL_FIELDS: FootballField[] = [
  {
    id: 'field_1',
    name: 'Sân A1',
    type: '5 người',
    pricePerHour: 300000,
    status: 'Hoạt động',
  },
  {
    id: 'field_2',
    name: 'Sân A2',
    type: '5 người',
    pricePerHour: 300000,
    status: 'Hoạt động',
  },
  {
    id: 'field_3',
    name: 'Sân B1',
    type: '7 người',
    pricePerHour: 500000,
    status: 'Hoạt động',
  },
  {
    id: 'field_4',
    name: 'Sân C1',
    type: '7 người',
    pricePerHour: 550000,
    status: 'Bảo trì',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    fieldId: 'field_1',
    customerName: 'Nguyễn Văn Nam',
    phone: '0912345678',
    date: '28/10/2026',
    startHour: 17,
    hours: 2, // 17h00 - 19h00
  },
  {
    id: 'booking_2',
    fieldId: 'field_1',
    customerName: 'Trần Đức Anh',
    phone: '0987654321',
    date: '28/10/2026',
    startHour: 19,
    hours: 2, // 19h00 - 21h00
  },
  {
    id: 'booking_3',
    fieldId: 'field_3',
    customerName: 'Lê Hoàng Long',
    phone: '0903112233',
    date: '29/10/2026',
    startHour: 8,
    hours: 2, // 08h00 - 10h00
  },
];

