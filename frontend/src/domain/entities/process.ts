/**
 * Process Entity
 * 공정 마스터 (절압착, 테이핑, 조립 등)
 */

export enum WorkType {
  IN_HOUSE = 'IN_HOUSE', // 내작
  OUTSOURCE = 'OUTSOURCE', // 외작
}

export interface Process {
  id: string;
  process_id: string; // 공정코드
  name: string; // 공정명
  equipment_name?: string; // 설비명
  work_type: WorkType;
  cycle_time?: number; // C/T (초)
  worker_count?: number; // 인원
  hourly_rate?: number; // 시간당 임률 (원/시간)
  efficiency?: number; // 효율 (%, 기본 100)
  created_at: string;
  updated_at: string;
}

export interface ProcessCreateInput {
  process_id: string;
  name: string;
  equipment_name?: string;
  work_type: WorkType;
  cycle_time?: number;
  worker_count?: number;
  hourly_rate?: number;
  efficiency?: number;
}

export interface ProcessUpdateInput {
  name?: string;
  equipment_name?: string;
  work_type?: WorkType;
  cycle_time?: number;
  worker_count?: number;
  hourly_rate?: number;
  efficiency?: number;
}

// Display labels for Korean UI
export const WorkTypeLabels: Record<WorkType, string> = {
  [WorkType.IN_HOUSE]: '내작',
  [WorkType.OUTSOURCE]: '외작',
};

// Legacy compatibility
export const WORK_TYPE_LABELS = WorkTypeLabels;
