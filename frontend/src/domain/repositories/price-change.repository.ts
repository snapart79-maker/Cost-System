/**
 * Price Change Repository Interface
 * 단가 변경 데이터 접근 인터페이스
 */

import type { PriceChange, PriceChangeCreateInput } from '../entities/price-change';
import type { QueryOptions, PaginatedResult } from './base.repository';

export interface PriceChangeQueryOptions extends QueryOptions {
  product_id?: string;
  start_date?: string;
  end_date?: string;
  eco_number?: string;
}

export interface IPriceChangeRepository {
  /**
   * 단가 변경 목록 조회
   */
  getAll(options?: PriceChangeQueryOptions): Promise<PaginatedResult<PriceChange>>;

  /**
   * 단가 변경 상세 조회
   */
  getById(id: string): Promise<PriceChange>;

  /**
   * 완제품별 단가 변경 이력 조회
   */
  getByProduct(productId: string): Promise<PriceChange[]>;

  /**
   * 단가 변경 등록
   */
  create(data: PriceChangeCreateInput): Promise<PriceChange>;

  /**
   * 원가 변경 전/후 비교 조회
   */
  compare(id: string): Promise<{
    before: PriceChange | null;
    current: PriceChange;
  }>;
}
