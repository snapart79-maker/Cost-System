/**
 * Material Entity
 * 자재 마스터 (전선, 터미널, 커넥터, 테이프, 튜브, 부자재)
 */

export enum MaterialType {
  WIRE = 'WIRE', // 전선
  TERMINAL = 'TERMINAL', // 터미널
  CONNECTOR = 'CONNECTOR', // 커넥터
  TAPE = 'TAPE', // 테이프
  TUBE = 'TUBE', // 튜브
  ACCESSORY = 'ACCESSORY', // 부자재
}

export enum MaterialUnit {
  MTR = 'MTR', // 미터
  EA = 'EA', // 개
  SET = 'SET', // 세트
  M = 'M', // 미터 (테이프)
}

export interface Material {
  id: string;
  material_id: string; // 품번
  name: string; // 품명
  spec?: string; // 규격
  material_type: MaterialType;
  unit: MaterialUnit;
  unit_price: number; // 단가 (소수점 4자리)
  scrap_rate?: number; // SCRAP율
  effective_date: string; // 적용일 (ISO date)
  created_at: string;
  updated_at: string;
}

export interface MaterialCreateInput {
  material_id: string;
  name: string;
  spec?: string;
  material_type: MaterialType;
  unit: MaterialUnit;
  unit_price: number;
  scrap_rate?: number;
  effective_date: string;
}

export interface MaterialUpdateInput {
  name?: string;
  spec?: string;
  material_type?: MaterialType;
  unit?: MaterialUnit;
  unit_price?: number;
  scrap_rate?: number;
  effective_date?: string;
}

// Display labels for Korean UI
export const MaterialTypeLabels: Record<MaterialType, string> = {
  [MaterialType.WIRE]: '전선',
  [MaterialType.TERMINAL]: '터미널',
  [MaterialType.CONNECTOR]: '커넥터',
  [MaterialType.TAPE]: '테이프',
  [MaterialType.TUBE]: '튜브',
  [MaterialType.ACCESSORY]: '부자재',
};

export const MaterialUnitLabels: Record<MaterialUnit, string> = {
  [MaterialUnit.MTR]: 'MTR',
  [MaterialUnit.EA]: 'EA',
  [MaterialUnit.SET]: 'SET',
  [MaterialUnit.M]: 'M',
};

// Legacy compatibility
export const MATERIAL_TYPE_LABELS = MaterialTypeLabels;
export const MATERIAL_UNIT_LABELS = MaterialUnitLabels;
