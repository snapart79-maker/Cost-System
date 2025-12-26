/**
 * Material Repository Implementation
 * 자재 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type { IMaterialRepository } from '@/domain/repositories/material.repository';
import type {
  Material,
  MaterialCreateInput,
  MaterialUpdateInput,
  MaterialType,
} from '@/domain/entities/material';

export class MaterialRepositoryImpl implements IMaterialRepository {
  async getAll(): Promise<Material[]> {
    const response = await handleApiCall(apiClient.get<Material[]>(API_ENDPOINTS.MATERIALS));
    return response.data;
  }

  async getById(id: string): Promise<Material> {
    const response = await handleApiCall(
      apiClient.get<Material>(API_ENDPOINTS.MATERIAL_BY_ID(id))
    );
    return response.data;
  }

  async getByType(type: MaterialType): Promise<Material[]> {
    const response = await handleApiCall(
      apiClient.get<Material[]>(API_ENDPOINTS.MATERIALS_BY_TYPE(type))
    );
    return response.data;
  }

  async create(data: MaterialCreateInput): Promise<Material> {
    const response = await handleApiCall(
      apiClient.post<Material>(API_ENDPOINTS.MATERIALS, data)
    );
    return response.data;
  }

  async update(id: string, data: MaterialUpdateInput): Promise<Material> {
    const response = await handleApiCall(
      apiClient.put<Material>(API_ENDPOINTS.MATERIAL_BY_ID(id), data)
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await handleApiCall(apiClient.delete(API_ENDPOINTS.MATERIAL_BY_ID(id)));
  }

  async bulkUpdate(
    materials: Array<{ id: string } & MaterialUpdateInput>
  ): Promise<Material[]> {
    const response = await handleApiCall(
      apiClient.put<Material[]>(API_ENDPOINTS.MATERIALS_BULK, { materials })
    );
    return response.data;
  }

  async search(query: string): Promise<Material[]> {
    const response = await handleApiCall(
      apiClient.get<Material[]>(API_ENDPOINTS.MATERIALS, {
        params: { search: query },
      })
    );
    return response.data;
  }
}

// Singleton instance
export const materialRepository = new MaterialRepositoryImpl();
