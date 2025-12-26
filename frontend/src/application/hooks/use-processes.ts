/**
 * useProcesses Hook
 * 공정 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProcessRepositoryImpl } from '@/infrastructure/repositories/process.repository.impl';
import type { Process, WorkType } from '@/domain/entities/process';

const repository = new ProcessRepositoryImpl();

export interface UseProcessesOptions {
  workType?: WorkType;
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface UseProcessesResult {
  processes: Process[] | undefined;
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
  createProcess: ReturnType<typeof useMutation<Process, Error, Omit<Process, 'id' | 'created_at' | 'updated_at'>>>;
  updateProcess: ReturnType<typeof useMutation<Process, Error, { id: string; data: Partial<Process> }>>;
  deleteProcess: ReturnType<typeof useMutation<void, Error, string>>;
}

const QUERY_KEY = 'processes';

export function useProcesses(options: UseProcessesOptions = {}): UseProcessesResult {
  const {
    workType,
    search,
    page = 1,
    pageSize = 20,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Query for fetching processes
  const query = useQuery({
    queryKey: [QUERY_KEY, { workType, search, page, pageSize }],
    queryFn: async () => {
      const processes = await repository.getAll();

      // Client-side filtering
      let filtered = processes;

      if (workType) {
        filtered = filtered.filter(p => p.work_type === workType);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.process_id.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    enabled,
  });

  // Create mutation
  const createProcess = useMutation({
    mutationFn: async (data: Omit<Process, 'id' | 'created_at' | 'updated_at'>) => {
      return repository.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Update mutation
  const updateProcess = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Process> }) => {
      return repository.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Delete mutation
  const deleteProcess = useMutation({
    mutationFn: async (id: string) => {
      return repository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    processes: query.data,
    isLoading: query.isLoading,
    error: query.error,
    pagination: query.data ? {
      page,
      pageSize,
      total: query.data.length,
      totalPages: Math.ceil(query.data.length / pageSize),
    } : undefined,
    refetch: query.refetch,
    createProcess,
    updateProcess,
    deleteProcess,
  };
}

export default useProcesses;
