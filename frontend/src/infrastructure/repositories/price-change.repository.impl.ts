/**
 * Price Change Repository Implementation
 * 단가 변경 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type {
  IPriceChangeRepository,
  PriceChangeQueryOptions,
} from '@/domain/repositories/price-change.repository';
import type { PaginatedResult } from '@/domain/repositories/base.repository';
import type { PriceChange, PriceChangeCreateInput } from '@/domain/entities/price-change';

export class PriceChangeRepositoryImpl implements IPriceChangeRepository {
  async getAll(options?: PriceChangeQueryOptions): Promise<PaginatedResult<PriceChange>> {
    const response = await handleApiCall(
      apiClient.get<PaginatedResult<PriceChange>>(API_ENDPOINTS.PRICE_CHANGES, {
        params: options,
      })
    );
    return response.data;
  }

  async getById(id: string): Promise<PriceChange> {
    const response = await handleApiCall(
      apiClient.get<PriceChange>(API_ENDPOINTS.PRICE_CHANGE_BY_ID(id))
    );
    return response.data;
  }

  async getByProduct(productId: string): Promise<PriceChange[]> {
    const response = await handleApiCall(
      apiClient.get<PriceChange[]>(API_ENDPOINTS.PRICE_CHANGES, {
        params: { product_id: productId },
      })
    );
    return response.data;
  }

  async create(data: PriceChangeCreateInput): Promise<PriceChange> {
    const response = await handleApiCall(
      apiClient.post<PriceChange>(API_ENDPOINTS.PRICE_CHANGES, data)
    );
    return response.data;
  }

  async compare(id: string): Promise<{ before: PriceChange | null; current: PriceChange }> {
    const response = await handleApiCall(
      apiClient.get<{ before: PriceChange | null; current: PriceChange }>(
        API_ENDPOINTS.PRICE_CHANGE_COMPARE,
        { params: { id } }
      )
    );
    return response.data;
  }
}

// Singleton instance
export const priceChangeRepository = new PriceChangeRepositoryImpl();
