/**
 * useBom Hook
 * BOM(Bill of Materials) 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BomRepositoryImpl } from '@/infrastructure/repositories/bom.repository.impl';
import type { BomItem, BomItemType, BomSummary } from '@/domain/entities/bom';

const repository = new BomRepositoryImpl();

export interface UseBomOptions {
  productId?: string;
  itemType?: BomItemType;
  enabled?: boolean;
}

export interface BomData {
  items: BomItem[];
  processes: BomItem[];
}

export interface UseBomResult {
  bomItems: BomItem[] | undefined;
  bomSummary: BomSummary | undefined;
  bomData: BomData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createBomItem: ReturnType<typeof useMutation<BomItem, Error, Omit<BomItem, 'id' | 'created_at' | 'updated_at'>>>;
  updateBomItem: ReturnType<typeof useMutation<BomItem, Error, { id: string; data: Partial<BomItem> }>>;
  deleteBomItem: ReturnType<typeof useMutation<void, Error, string>>;
}

const QUERY_KEY = 'bom';

export function useBom(options: UseBomOptions = {}): UseBomResult {
  const {
    productId,
    itemType,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Query for fetching BOM items
  const itemsQuery = useQuery({
    queryKey: [QUERY_KEY, 'items', { productId, itemType }],
    queryFn: async () => {
      if (!productId) return [];

      const items = await repository.getByProductId(productId);

      // Client-side filtering by item type
      if (itemType) {
        return items.filter(item => item.item_type === itemType);
      }

      return items;
    },
    enabled: enabled && !!productId,
  });

  // Query for fetching BOM summary
  const summaryQuery = useQuery({
    queryKey: [QUERY_KEY, 'summary', productId],
    queryFn: async () => {
      if (!productId) return undefined;
      return repository.getSummary(productId);
    },
    enabled: enabled && !!productId,
  });

  // Create mutation
  const createBomItem = useMutation({
    mutationFn: async (data: Omit<BomItem, 'id' | 'created_at' | 'updated_at'>) => {
      return repository.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Update mutation
  const updateBomItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BomItem> }) => {
      return repository.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Delete mutation
  const deleteBomItem = useMutation({
    mutationFn: async (id: string) => {
      return repository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Separate items by type (materials vs processes)
  const bomData: BomData | undefined = itemsQuery.data
    ? {
        items: itemsQuery.data.filter(
          (item) => item.item_type === 'MATERIAL'
        ),
        processes: itemsQuery.data.filter(
          (item) => item.item_type === 'PROCESS'
        ),
      }
    : undefined;

  return {
    bomItems: itemsQuery.data,
    bomSummary: summaryQuery.data,
    bomData,
    isLoading: itemsQuery.isLoading || summaryQuery.isLoading,
    error: itemsQuery.error || summaryQuery.error,
    refetch: () => {
      itemsQuery.refetch();
      summaryQuery.refetch();
    },
    createBomItem,
    updateBomItem,
    deleteBomItem,
  };
}

export default useBom;
