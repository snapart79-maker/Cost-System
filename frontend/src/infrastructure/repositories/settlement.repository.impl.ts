/**
 * Settlement Repository Implementation
 * 정산 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type {
  ISettlementRepository,
  SettlementQueryOptions,
} from '@/domain/repositories/settlement.repository';
import type { PaginatedResult } from '@/domain/repositories/base.repository';
import type {
  Settlement,
  SettlementCalculateInput,
  SettlementSaveInput,
  SettlementResult,
} from '@/domain/entities/settlement';

export class SettlementRepositoryImpl implements ISettlementRepository {
  async getHistory(options?: SettlementQueryOptions): Promise<PaginatedResult<Settlement>> {
    const response = await handleApiCall(
      apiClient.get<PaginatedResult<Settlement>>(API_ENDPOINTS.SETTLEMENT_HISTORY, {
        params: options,
      })
    );
    return response.data;
  }

  async getById(id: string): Promise<Settlement> {
    const response = await handleApiCall(
      apiClient.get<Settlement>(API_ENDPOINTS.SETTLEMENT_BY_ID(id))
    );
    return response.data;
  }

  async calculate(data: SettlementCalculateInput): Promise<SettlementResult[]> {
    const response = await handleApiCall(
      apiClient.post<SettlementResult[]>(API_ENDPOINTS.SETTLEMENT_CALCULATE, data)
    );
    return response.data;
  }

  async save(data: SettlementSaveInput): Promise<Settlement> {
    const response = await handleApiCall(
      apiClient.post<Settlement>(API_ENDPOINTS.SETTLEMENT, data)
    );
    return response.data;
  }

  async getSummary(): Promise<{
    pending_count: number;
    total_amount: number;
    this_month_count: number;
  }> {
    const response = await handleApiCall(
      apiClient.get<{
        pending_count: number;
        total_amount: number;
        this_month_count: number;
      }>(`${API_ENDPOINTS.SETTLEMENT}/summary`)
    );
    return response.data;
  }
}

// Singleton instance
export const settlementRepository = new SettlementRepositoryImpl();
