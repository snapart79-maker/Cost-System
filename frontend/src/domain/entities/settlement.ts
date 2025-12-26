/**
 * Settlement Entity
 * 정산 관리
 */

import type { PriceChange } from './price-change';
import type { Product } from './product';

export type PeriodType = 'DAILY' | 'MONTHLY' | 'YEARLY';

export interface SettlementCondition {
  price_change_id: string;
  product_ids: string[];
  start_date: string;
  end_date: string;
  period_type: PeriodType;
}

export interface ReceiptQuantity {
  product_id: string;
  product?: Product;
  period: string; // 기간 (일자/월/연도)
  quantity: number; // 입고 수량
}

export interface SettlementPeriodDetail {
  period: string;
  quantity: number;
  amount: number;
}

export interface SettlementResult {
  product_id: string;
  product?: Product;
  total_quantity: number; // 총 수량
  unit_price_diff: number; // 단가 변경분
  settlement_amount: number; // 정산 금액
  period_details: SettlementPeriodDetail[];
}

export interface Settlement {
  id: string;
  price_change_id: string;
  price_change?: PriceChange;
  condition: SettlementCondition;
  results: SettlementResult[];
  total_settlement_amount: number;
  created_at: string;
  created_by: string;
}

export interface SettlementCalculateInput {
  price_change_id: string;
  product_ids: string[];
  start_date: string;
  end_date: string;
  period_type: PeriodType;
  receipt_quantities: ReceiptQuantity[];
}

export interface SettlementSaveInput extends SettlementCalculateInput {
  results: SettlementResult[];
  total_settlement_amount: number;
}

// Display labels for Korean UI
export const PeriodTypeLabels: Record<PeriodType, string> = {
  DAILY: '일별',
  MONTHLY: '월별',
  YEARLY: '연간',
};
