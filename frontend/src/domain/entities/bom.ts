/**
 * BOM (Bill of Materials) Entity
 * 자재 및 공정 구성 정보
 */

import type { WorkType } from './process';

// BOM 항목 유형 (자재/공정)
export enum BomItemType {
  MATERIAL = 'MATERIAL', // 자재
  PROCESS = 'PROCESS', // 공정
}

// Display labels for Korean UI
export const BOM_ITEM_TYPE_LABELS: Record<BomItemType, string> = {
  [BomItemType.MATERIAL]: '자재',
  [BomItemType.PROCESS]: '공정',
};

// 통합 BOM 항목 인터페이스
export interface BomItem {
  id: string;
  product_id: string;
  item_type: BomItemType; // 자재 또는 공정
  item_code: string; // 자재코드 또는 공정코드
  item_name: string; // 자재명 또는 공정명
  specification?: string; // 규격
  unit?: string; // 단위
  quantity: number; // 소요량 (자재) 또는 C/T (공정)
  unit_price?: number; // 단가
  amount?: number; // 금액 (소요량 * 단가)
  work_type?: WorkType; // 내작/외작
  workers?: number; // 인원 (공정만)
  seq?: number; // 순번
  created_at: string;
  updated_at: string;
}

// BOM 요약 정보
export interface BomSummary {
  product_id: string;
  material_count: number; // 자재 항목 수
  process_count: number; // 공정 항목 수
  total_material_cost: number; // 총 재료비
  total_process_cost: number; // 총 가공비
}

// 전체 BOM 구조
export interface Bom {
  product_id: string;
  items: BomItem[];
  summary: BomSummary;
}

// 생성/수정 입력 타입
export interface BomItemCreateInput {
  product_id: string;
  item_type: BomItemType;
  item_code: string;
  item_name: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unit_price?: number;
  work_type?: WorkType;
  workers?: number;
  seq?: number;
}

export interface BomItemUpdateInput {
  item_name?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unit_price?: number;
  work_type?: WorkType;
  workers?: number;
  seq?: number;
}

export interface BomBulkUpdateInput {
  items: BomItemCreateInput[];
}
