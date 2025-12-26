/**
 * useCostCalculation Hook
 * 원가 계산 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CostCalculationRepositoryImpl } from '@/infrastructure/repositories/cost-calculation.repository.impl';
import type {
  CostBreakdown,
  CostPreviewResult,
  CostComparisonInput,
  CostRates,
} from '@/domain/entities/cost-calculation';

const repository = new CostCalculationRepositoryImpl();

export interface UseCostCalculationOptions {
  productId?: string;
  includeCostRates?: boolean;
  enabled?: boolean;
}

export interface UseCostCalculationResult {
  // Query results
  costBreakdown: CostBreakdown | undefined;
  costRates: CostRates | undefined;
  isLoading: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
  calculate: ReturnType<typeof useMutation<CostBreakdown, Error, string>>;
  preview: ReturnType<typeof useMutation<CostPreviewResult, Error, CostComparisonInput>>;
  saveCostRates: ReturnType<typeof useMutation<CostRates, Error, CostRates>>;
}

const QUERY_KEY = 'cost-calculation';
const COST_RATES_KEY = 'cost-rates';

export function useCostCalculation(
  options: UseCostCalculationOptions = {}
): UseCostCalculationResult {
  const { productId, includeCostRates = false, enabled = true } = options;

  const queryClient = useQueryClient();

  // Query for cost breakdown
  const breakdownQuery = useQuery({
    queryKey: [QUERY_KEY, 'breakdown', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      return repository.getBreakdown(productId);
    },
    enabled: enabled && !!productId,
  });

  // Query for cost rates
  const costRatesQuery = useQuery({
    queryKey: [COST_RATES_KEY],
    queryFn: async () => {
      return repository.getCostRates();
    },
    enabled: enabled && includeCostRates,
  });

  // Calculate mutation
  const calculate = useMutation({
    mutationFn: async (productId: string) => {
      return repository.calculate(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'breakdown', productId] });
    },
  });

  // Preview mutation
  const preview = useMutation({
    mutationFn: async (data: CostComparisonInput) => {
      return repository.preview(data);
    },
  });

  // Save cost rates mutation
  const saveCostRates = useMutation({
    mutationFn: async (rates: CostRates) => {
      return repository.saveCostRates(rates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COST_RATES_KEY] });
      // Also invalidate all cost calculations since rates affect them
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const isLoading = breakdownQuery.isLoading || costRatesQuery.isLoading;
  const error = breakdownQuery.error || costRatesQuery.error;

  return {
    costBreakdown: breakdownQuery.data,
    costRates: costRatesQuery.data,
    isLoading,
    error,
    refetch: async () => {
      await breakdownQuery.refetch();
      if (includeCostRates) {
        await costRatesQuery.refetch();
      }
    },
    calculate,
    preview,
    saveCostRates,
  };
}

export default useCostCalculation;
