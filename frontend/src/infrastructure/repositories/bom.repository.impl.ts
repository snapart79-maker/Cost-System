/**
 * BOM Repository Implementation
 * BOM 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type { IBomRepository } from '@/domain/repositories/bom.repository';
import type {
  Bom,
  BomItem,
  BomSummary,
  BomBulkUpdateInput,
} from '@/domain/entities/bom';

export class BomRepositoryImpl implements IBomRepository {
  async getByProduct(productId: string): Promise<Bom> {
    const response = await handleApiCall(
      apiClient.get<Bom>(API_ENDPOINTS.BOM_BY_PRODUCT(productId))
    );
    return response.data;
  }

  async getByProductId(productId: string): Promise<BomItem[]> {
    const response = await handleApiCall(
      apiClient.get<BomItem[]>(API_ENDPOINTS.BOM_ITEMS(productId))
    );
    return response.data;
  }

  async getSummary(productId: string): Promise<BomSummary> {
    const response = await handleApiCall(
      apiClient.get<BomSummary>(`${API_ENDPOINTS.BOM}/summary/${productId}`)
    );
    return response.data;
  }

  async create(data: Omit<BomItem, 'id' | 'created_at' | 'updated_at'>): Promise<BomItem> {
    const response = await handleApiCall(
      apiClient.post<BomItem>(API_ENDPOINTS.BOM, data)
    );
    return response.data;
  }

  async update(id: string, data: Partial<BomItem>): Promise<BomItem> {
    const response = await handleApiCall(
      apiClient.put<BomItem>(`${API_ENDPOINTS.BOM}/${id}`, data)
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await handleApiCall(apiClient.delete(`${API_ENDPOINTS.BOM}/${id}`));
  }

  async bulkUpdate(productId: string, data: BomBulkUpdateInput): Promise<Bom> {
    const response = await handleApiCall(
      apiClient.put<Bom>(API_ENDPOINTS.BOM_BULK_UPDATE(productId), data)
    );
    return response.data;
  }
}

// Singleton instance
export const bomRepository = new BomRepositoryImpl();
