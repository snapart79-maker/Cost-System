/**
 * useMaterials Hook
 * 자재 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialRepositoryImpl } from '@/infrastructure/repositories/material.repository.impl';
import type { Material, MaterialType } from '@/domain/entities/material';

const repository = new MaterialRepositoryImpl();

export interface UseMaterialsOptions {
  type?: MaterialType;
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface UseMaterialsResult {
  materials: Material[] | undefined;
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
  createMaterial: ReturnType<typeof useMutation<Material, Error, Omit<Material, 'id' | 'created_at' | 'updated_at'>>>;
  updateMaterial: ReturnType<typeof useMutation<Material, Error, { id: string; data: Partial<Material> }>>;
  deleteMaterial: ReturnType<typeof useMutation<void, Error, string>>;
}

const QUERY_KEY = 'materials';

export function useMaterials(options: UseMaterialsOptions = {}): UseMaterialsResult {
  const {
    type,
    search,
    page = 1,
    pageSize = 20,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Query for fetching materials
  const query = useQuery({
    queryKey: [QUERY_KEY, { type, search, page, pageSize }],
    queryFn: async () => {
      const materials = await repository.getAll();

      // Client-side filtering
      let filtered = materials;

      if (type) {
        filtered = filtered.filter(m => m.material_type === type);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.material_id.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    enabled,
  });

  // Create mutation
  const createMaterial = useMutation({
    mutationFn: async (data: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
      return repository.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Update mutation
  const updateMaterial = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Material> }) => {
      return repository.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Delete mutation
  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      return repository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    materials: query.data,
    isLoading: query.isLoading,
    error: query.error,
    pagination: query.data ? {
      page,
      pageSize,
      total: query.data.length,
      totalPages: Math.ceil(query.data.length / pageSize),
    } : undefined,
    refetch: query.refetch,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}

export default useMaterials;
