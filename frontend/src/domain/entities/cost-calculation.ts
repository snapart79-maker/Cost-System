/**
 * Cost Calculation Entity
 * 원가 계산 결과
 */

import type { Material } from './material';
import type { Process, WorkType } from './process';
import type { Product } from './product';

export interface MaterialCostDetail {
  material_id: string;
  material: Material;
  work_type: WorkType;
  quantity: number;
  unit_price: number;
  material_cost: number;
  scrap_cost: number;
  net_material_cost: number;
}

export interface ProcessCostDetail {
  process_id: string;
  process: Process;
  work_type: WorkType;
  cycle_time: number;
  workers: number;
  production_volume: number; // 생산량 = 3600 / C/T
  labor_cost: number;
  expense: number;
  total_process_cost: number;
}

export interface CostBreakdown {
  product_id: string;
  product?: Product;

  // 재료비
  inhouse_material_cost: number;
  outsource_material_cost: number;
  total_material_cost: number;

  // 노무비
  inhouse_labor_cost: number;
  outsource_labor_cost: number;
  total_labor_cost: number;

  // 경비
  inhouse_expense: number;
  outsource_expense: number;
  total_expense: number;

  // 제조원가
  inhouse_manufacturing_cost: number;
  outsource_manufacturing_cost: number;
  total_manufacturing_cost: number;

  // 원가 요소
  material_management_cost: number; // 재료관리비 (재료비 × 1%)
  general_management_cost: number; // 일반관리비 ((노무비 + 경비) × 10%)
  defect_cost: number; // 불량비 (제조원가 × 1%)
  profit: number; // 이윤 ((노무비 + 경비 + 일반관리비) × 10%)

  // 구매원가
  inhouse_purchase_cost: number;
  outsource_purchase_cost: number;
  total_purchase_cost: number;

  // 상세 항목
  material_details: MaterialCostDetail[];
  process_details: ProcessCostDetail[];
}

export interface CostSummary {
  material_cost: number;
  labor_cost: number;
  expense: number;
  manufacturing_cost: number;
  purchase_cost: number;
}

export interface CostPreviewResult {
  before: CostSummary;
  after: CostSummary;
  diff: CostSummary;
}

export interface CostComparisonInput {
  product_id: string;
  material_changes: Array<{
    material_id: string;
    status: string;
    quantity?: number;
    unit_price?: number;
  }>;
  process_changes: Array<{
    process_id: string;
    status: string;
    cycle_time?: number;
    workers?: number;
  }>;
}

// Cost rate configuration
export interface CostRates {
  material_management_rate: number; // 재료관리비율 (default: 0.01)
  general_management_rate: number; // 일반관리비율 (default: 0.10)
  defect_rate: number; // 불량비율 (default: 0.01)
  profit_rate: number; // 이윤율 (default: 0.10)
}

export const DEFAULT_COST_RATES: CostRates = {
  material_management_rate: 0.01,
  general_management_rate: 0.1,
  defect_rate: 0.01,
  profit_rate: 0.1,
};
