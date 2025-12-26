/**
 * Cost Calculation Repository Implementation
 * 원가 계산 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type { ICostCalculationRepository } from '@/domain/repositories/cost-calculation.repository';
import type {
  CostBreakdown,
  CostPreviewResult,
  CostComparisonInput,
  CostRates,
} from '@/domain/entities/cost-calculation';

export class CostCalculationRepositoryImpl implements ICostCalculationRepository {
  async calculate(productId: string): Promise<CostBreakdown> {
    const response = await handleApiCall(
      apiClient.post<CostBreakdown>(API_ENDPOINTS.COST_CALCULATE, { product_id: productId })
    );
    return response.data;
  }

  async getBreakdown(productId: string): Promise<CostBreakdown> {
    const response = await handleApiCall(
      apiClient.get<CostBreakdown>(API_ENDPOINTS.COST_BREAKDOWN(productId))
    );
    return response.data;
  }

  async preview(data: CostComparisonInput): Promise<CostPreviewResult> {
    const response = await handleApiCall(
      apiClient.post<CostPreviewResult>(API_ENDPOINTS.COST_PREVIEW, data)
    );
    return response.data;
  }

  async compare(
    productId: string,
    version1: string,
    version2: string
  ): Promise<{ version1: CostBreakdown; version2: CostBreakdown }> {
    const response = await handleApiCall(
      apiClient.get<{ version1: CostBreakdown; version2: CostBreakdown }>(
        `${API_ENDPOINTS.COST_CALCULATION}/compare`,
        { params: { product_id: productId, v1: version1, v2: version2 } }
      )
    );
    return response.data;
  }

  async getCostRates(): Promise<CostRates> {
    const response = await handleApiCall(
      apiClient.get<CostRates>(API_ENDPOINTS.SETTINGS_COST_RATES)
    );
    return response.data;
  }

  async saveCostRates(rates: CostRates): Promise<CostRates> {
    const response = await handleApiCall(
      apiClient.put<CostRates>(API_ENDPOINTS.SETTINGS_COST_RATES, rates)
    );
    return response.data;
  }
}

// Singleton instance
export const costCalculationRepository = new CostCalculationRepositoryImpl();
