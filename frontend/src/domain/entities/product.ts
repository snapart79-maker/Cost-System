/**
 * Product Entity
 * 완제품 마스터 (와이어 하네스)
 */

export enum ProductStatus {
  PRODUCTION = 'PRODUCTION', // 양산
  DEVELOPMENT = 'DEVELOPMENT', // 개발
  DISCONTINUED = 'DISCONTINUED', // 단종
}

export interface Product {
  id: string;
  product_id: string; // 품번
  name: string; // 품명
  customer_pn?: string; // 고객품번
  customer_name?: string; // 고객사
  vehicle_model?: string; // 차종
  model_year?: string; // 연식
  status: ProductStatus;
  current_purchase_cost?: number; // 현재 구매원가
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  product_id: string;
  name: string;
  customer_pn?: string;
  customer_name?: string;
  vehicle_model?: string;
  model_year?: string;
  status?: ProductStatus;
  current_purchase_cost?: number;
}

export interface ProductUpdateInput {
  name?: string;
  customer_pn?: string;
  customer_name?: string;
  vehicle_model?: string;
  model_year?: string;
  status?: ProductStatus;
  current_purchase_cost?: number;
}

// Display labels for Korean UI
export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.PRODUCTION]: '양산',
  [ProductStatus.DEVELOPMENT]: '개발',
  [ProductStatus.DISCONTINUED]: '단종',
};

// Legacy compatibility
export const PRODUCT_STATUS_LABELS = ProductStatusLabels;
