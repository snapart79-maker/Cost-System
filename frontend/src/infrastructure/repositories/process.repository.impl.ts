/**
 * Process Repository Implementation
 * 공정 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type { IProcessRepository } from '@/domain/repositories/process.repository';
import type {
  Process,
  ProcessCreateInput,
  ProcessUpdateInput,
  WorkType,
} from '@/domain/entities';

export class ProcessRepositoryImpl implements IProcessRepository {
  async getAll(): Promise<Process[]> {
    const response = await handleApiCall(apiClient.get<Process[]>(API_ENDPOINTS.PROCESSES));
    return response.data;
  }

  async getById(id: string): Promise<Process> {
    const response = await handleApiCall(
      apiClient.get<Process>(API_ENDPOINTS.PROCESS_BY_ID(id))
    );
    return response.data;
  }

  async getByWorkType(workType: WorkType): Promise<Process[]> {
    const response = await handleApiCall(
      apiClient.get<Process[]>(API_ENDPOINTS.PROCESSES_BY_WORK_TYPE(workType))
    );
    return response.data;
  }

  async create(data: ProcessCreateInput): Promise<Process> {
    const response = await handleApiCall(
      apiClient.post<Process>(API_ENDPOINTS.PROCESSES, data)
    );
    return response.data;
  }

  async update(id: string, data: ProcessUpdateInput): Promise<Process> {
    const response = await handleApiCall(
      apiClient.put<Process>(API_ENDPOINTS.PROCESS_BY_ID(id), data)
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await handleApiCall(apiClient.delete(API_ENDPOINTS.PROCESS_BY_ID(id)));
  }

  async bulkUpdate(
    processes: Array<{ id: string } & ProcessUpdateInput>
  ): Promise<Process[]> {
    const response = await handleApiCall(
      apiClient.put<Process[]>(API_ENDPOINTS.PROCESSES_BULK, { processes })
    );
    return response.data;
  }

  async search(query: string): Promise<Process[]> {
    const response = await handleApiCall(
      apiClient.get<Process[]>(API_ENDPOINTS.PROCESSES, {
        params: { search: query },
      })
    );
    return response.data;
  }
}

// Singleton instance
export const processRepository = new ProcessRepositoryImpl();
