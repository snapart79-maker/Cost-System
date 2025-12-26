import Decimal from 'decimal.js';
import dayjs from 'dayjs';

// 금액 포맷 (천단위 콤마, 소수점 2자리)
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  const num = new Decimal(value);
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 수량 포맷 (소수점 4자리까지)
export const formatQuantity = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  const num = new Decimal(value);
  return num.toFixed(4).replace(/\.?0+$/, '');
};

// 퍼센트 포맷
export const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  const num = new Decimal(value).times(100);
  return `${num.toFixed(1)}%`;
};

// 날짜 포맷
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD');
};

// 날짜시간 포맷
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 숫자 파싱 (문자열 -> Decimal)
export const parseNumber = (value: string): Decimal | null => {
  const cleaned = value.replace(/,/g, '');
  try {
    return new Decimal(cleaned);
  } catch {
    return null;
  }
};
