/**
 * Cost Calculation Repository Interface
 * 원가 계산 데이터 접근 인터페이스
 */

import type {
  CostBreakdown,
  CostPreviewResult,
  CostComparisonInput,
  CostRates,
} from '../entities/cost-calculation';

export interface ICostCalculationRepository {
  /**
   * 원가 계산 실행
   */
  calculate(productId: string): Promise<CostBreakdown>;

  /**
   * 원가 계산서 상세 조회
   */
  getBreakdown(productId: string): Promise<CostBreakdown>;

  /**
   * 원가 변경 미리보기 (변경 전 시뮬레이션)
   */
  preview(data: CostComparisonInput): Promise<CostPreviewResult>;

  /**
   * 원가 비교 (두 버전 비교)
   */
  compare(
    productId: string,
    version1: string,
    version2: string
  ): Promise<{
    version1: CostBreakdown;
    version2: CostBreakdown;
  }>;

  /**
   * 원가 비율 설정 조회
   */
  getCostRates(): Promise<CostRates>;

  /**
   * 원가 비율 설정 저장
   */
  saveCostRates(rates: CostRates): Promise<CostRates>;
}
