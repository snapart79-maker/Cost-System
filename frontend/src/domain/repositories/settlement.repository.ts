/**
 * Settlement Repository Interface
 * 정산 데이터 접근 인터페이스
 */

import type {
  Settlement,
  SettlementCalculateInput,
  SettlementSaveInput,
  SettlementResult,
} from '../entities/settlement';
import type { QueryOptions, PaginatedResult } from './base.repository';

export interface SettlementQueryOptions extends QueryOptions {
  price_change_id?: string;
  product_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface ISettlementRepository {
  /**
   * 정산 이력 목록 조회
   */
  getHistory(options?: SettlementQueryOptions): Promise<PaginatedResult<Settlement>>;

  /**
   * 정산 상세 조회
   */
  getById(id: string): Promise<Settlement>;

  /**
   * 정산 금액 계산
   */
  calculate(data: SettlementCalculateInput): Promise<SettlementResult[]>;

  /**
   * 정산 결과 저장
   */
  save(data: SettlementSaveInput): Promise<Settlement>;

  /**
   * 정산 요약 조회 (대시보드용)
   */
  getSummary(): Promise<{
    pending_count: number;
    total_amount: number;
    this_month_count: number;
  }>;
}
