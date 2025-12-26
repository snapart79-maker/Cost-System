/**
 * usePriceChange Hook
 * 단가 변경 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { PriceChangeRepositoryImpl } from '@/infrastructure/repositories/price-change.repository.impl';
import type {
  PriceChange,
  PriceChangeCreateInput,
} from '@/domain/entities/price-change';

const repository = new PriceChangeRepositoryImpl();

// Validation Schema
const PriceChangeSchema = z.object({
  product_id: z.string().min(1, '완제품을 선택해주세요'),
  change_type: z.enum(['MATERIAL', 'PROCESS', 'COMBINED'] as const, {
    errorMap: () => ({ message: '변경 유형을 선택해주세요' }),
  }),
  change_reason: z.string().min(1, '변경 사유를 입력해주세요'),
  eco_number: z.string().optional(),
  effective_date: z.string().min(1, '적용일을 선택해주세요'),
  material_changes: z
    .array(
      z.object({
        material_id: z.string(),
        status: z.enum(['NEW', 'MODIFIED', 'DELETED', 'UNCHANGED'] as const),
        quantity: z.number().optional(),
        unit_price: z.number().optional(),
      })
    )
    .optional()
    .default([]),
  process_changes: z
    .array(
      z.object({
        process_id: z.string(),
        status: z.enum(['NEW', 'MODIFIED', 'DELETED', 'UNCHANGED'] as const),
        cycle_time: z.number().optional(),
        workers: z.number().optional(),
      })
    )
    .optional()
    .default([]),
});

export interface UsePriceChangeOptions {
  id?: string;
  product_id?: string;
  start_date?: string;
  end_date?: string;
  eco_number?: string;
  compareId?: string;
  includeHistory?: boolean;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface UsePriceChangeResult {
  // Query results
  priceChanges: PriceChange[] | undefined;
  priceChange: PriceChange | undefined;
  comparison:
    | {
        before: PriceChange | null;
        current: PriceChange;
      }
    | undefined;
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  refetch: () => void;
  createPriceChange: ReturnType<
    typeof useMutation<PriceChange, Error, PriceChangeCreateInput>
  >;

  // Validation
  validatePriceChange: (data: PriceChangeCreateInput) => PriceChangeCreateInput;
}

const QUERY_KEY = 'price-changes';

export function usePriceChange(
  options: UsePriceChangeOptions = {}
): UsePriceChangeResult {
  const {
    id,
    product_id,
    start_date,
    end_date,
    eco_number,
    compareId,
    includeHistory,
    page = 1,
    pageSize = 20,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Query for fetching all price changes (list)
  const listQuery = useQuery({
    queryKey: [QUERY_KEY, 'list', { product_id, start_date, end_date, eco_number, page, pageSize }],
    queryFn: async () => {
      const result = await repository.getAll({
        product_id,
        start_date,
        end_date,
        eco_number,
        page,
        page_size: pageSize,
      });
      return result;
    },
    enabled: enabled && !id && !compareId,
  });

  // Query for fetching single price change by ID
  const singleQuery = useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      return repository.getById(id);
    },
    enabled: enabled && !!id && !compareId,
  });

  // Query for comparing price changes
  const compareQuery = useQuery({
    queryKey: [QUERY_KEY, 'compare', compareId],
    queryFn: async () => {
      if (!compareId) throw new Error('Compare ID is required');
      return repository.compare(compareId);
    },
    enabled: enabled && !!compareId,
  });

  // Query for product history
  const historyQuery = useQuery({
    queryKey: [QUERY_KEY, 'history', product_id],
    queryFn: async () => {
      if (!product_id) throw new Error('Product ID is required');
      return repository.getByProduct(product_id);
    },
    enabled: enabled && !!product_id && !!includeHistory,
  });

  // Create mutation
  const createPriceChange = useMutation({
    mutationFn: async (data: PriceChangeCreateInput) => {
      // Validate before sending
      const validated = PriceChangeSchema.parse(data);
      return repository.create(validated as PriceChangeCreateInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Validation function
  const validatePriceChange = (data: PriceChangeCreateInput): PriceChangeCreateInput => {
    const result = PriceChangeSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map((e) => e.message).join(', ');
      throw new Error(errorMessages);
    }
    return result.data as PriceChangeCreateInput;
  };

  // Determine which data to return
  const isLoading =
    listQuery.isLoading ||
    singleQuery.isLoading ||
    compareQuery.isLoading ||
    historyQuery.isLoading;

  const error =
    listQuery.error || singleQuery.error || compareQuery.error || historyQuery.error;

  // Get the appropriate data based on query type
  let priceChanges: PriceChange[] | undefined;
  let paginationInfo:
    | {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }
    | undefined;

  if (includeHistory && historyQuery.data) {
    priceChanges = historyQuery.data;
  } else if (listQuery.data) {
    priceChanges = listQuery.data.items;
    paginationInfo = {
      page: listQuery.data.page,
      pageSize: listQuery.data.page_size,
      total: listQuery.data.total,
      totalPages: listQuery.data.total_pages,
    };
  }

  return {
    priceChanges,
    priceChange: singleQuery.data,
    comparison: compareQuery.data,
    isLoading,
    error,
    pagination: paginationInfo,
    refetch: () => {
      listQuery.refetch();
      singleQuery.refetch();
      compareQuery.refetch();
      historyQuery.refetch();
    },
    createPriceChange,
    validatePriceChange,
  };
}

export default usePriceChange;
