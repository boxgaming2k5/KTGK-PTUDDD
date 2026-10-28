/**
 * Hàm định dạng dữ liệu hiển thị
 */

/**
 * Định dạng tiền tệ VND theo đúng yêu cầu đề bài: "300.000 đ/giờ"
 */
export function formatCurrencyPerHour(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 đ/giờ';
  }
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} đ/giờ`;
}

/**
 * Định dạng số tiền thành tiền tổng cộng (VD: 600.000 đ)
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 đ';
  }
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} đ`;
}

/**
 * Định dạng khung giờ (VD: 17, 2 -> "17:00 - 19:00" hoặc "17h - 19h")
 */
export function formatTimeSlot(startHour: number, hours: number): string {
  const endHour = startHour + hours;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(startHour)}:00 - ${pad(endHour)}:00 (${hours} giờ)`;
}

