/**
 * Price Change Entity
 * 단가 변경 이력
 */

import type { Material } from './material';
import type { Process } from './process';
import type { Product } from './product';

export enum ChangeType {
  MATERIAL = 'MATERIAL', // 재료비
  PROCESS = 'PROCESS', // 가공비
  COMBINED = 'COMBINED', // 복합
}

export enum ChangeItemStatus {
  NEW = 'NEW', // 신규
  MODIFIED = 'MODIFIED', // 수정
  DELETED = 'DELETED', // 삭제
  UNCHANGED = 'UNCHANGED', // 변경없음
}

export interface MaterialChangeItem {
  material_id: string;
  material?: Material;
  status: ChangeItemStatus;
  before_quantity?: number;
  after_quantity?: number;
  before_unit_price?: number;
  after_unit_price?: number;
  before_cost?: number;
  after_cost?: number;
  cost_diff?: number;
}

export interface ProcessChangeItem {
  process_id: string;
  process?: Process;
  status: ChangeItemStatus;
  before_cycle_time?: number;
  after_cycle_time?: number;
  before_workers?: number;
  after_workers?: number;
  before_cost?: number;
  after_cost?: number;
  cost_diff?: number;
}

export interface PriceChange {
  id: string;
  product_id: string;
  product?: Product;
  change_type: ChangeType;
  change_reason: string;
  eco_number?: string;
  effective_date: string;
  before_cost: number;
  after_cost: number;
  cost_diff: number;
  material_changes: MaterialChangeItem[];
  process_changes: ProcessChangeItem[];
  created_at: string;
  created_by: string;
}

export interface MaterialChangeInput {
  material_id: string;
  status: ChangeItemStatus;
  quantity?: number;
  unit_price?: number;
}

export interface ProcessChangeInput {
  process_id: string;
  status: ChangeItemStatus;
  cycle_time?: number;
  workers?: number;
}

export interface PriceChangeCreateInput {
  product_id: string;
  change_type: ChangeType;
  change_reason: string;
  eco_number?: string;
  effective_date: string;
  material_changes: MaterialChangeInput[];
  process_changes: ProcessChangeInput[];
}

// Display labels for Korean UI
export const ChangeTypeLabels: Record<ChangeType, string> = {
  [ChangeType.MATERIAL]: '재료비',
  [ChangeType.PROCESS]: '가공비',
  [ChangeType.COMBINED]: '복합',
};

export const ChangeItemStatusLabels: Record<ChangeItemStatus, string> = {
  [ChangeItemStatus.NEW]: '신규',
  [ChangeItemStatus.MODIFIED]: '수정',
  [ChangeItemStatus.DELETED]: '삭제',
  [ChangeItemStatus.UNCHANGED]: '변경없음',
};
