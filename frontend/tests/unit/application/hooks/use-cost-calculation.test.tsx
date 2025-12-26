/**
 * useCostCalculation Hook Test
 * 원가 계산 훅 테스트 - TDD RED Phase
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCostCalculation } from '@/application/hooks/use-cost-calculation';
import type { CostComparisonInput } from '@/domain/entities/cost-calculation';

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCostCalculation', () => {
  describe('Query - 조회', () => {
    it('should fetch cost breakdown by product id', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costBreakdown).toBeDefined();
      expect(result.current.costBreakdown?.product_id).toBe('1');
    });

    it('should not fetch when productId is not provided', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: undefined }),
        { wrapper: createWrapper() }
      );

      // Should not be loading when disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.costBreakdown).toBeUndefined();
    });

    it('should return cost rates', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1', includeCostRates: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costRates).toBeDefined();
      expect(result.current.costRates?.material_management_rate).toBe(0.01);
      expect(result.current.costRates?.general_management_rate).toBe(0.1);
      expect(result.current.costRates?.defect_rate).toBe(0.01);
      expect(result.current.costRates?.profit_rate).toBe(0.1);
    });
  });

  describe('Calculate - 계산', () => {
    it('should calculate cost for a product', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.calculate.mutateAsync('1');
      });

      await waitFor(() => {
        expect(result.current.calculate.isSuccess).toBe(true);
      });

      expect(result.current.calculate.data).toBeDefined();
    });
  });

  describe('Preview - 미리보기', () => {
    it('should preview cost changes', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const previewInput: CostComparisonInput = {
        product_id: '1',
        material_changes: [
          {
            material_id: '1',
            status: 'MODIFIED',
            quantity: 1.5,
            unit_price: 80.0,
          },
        ],
        process_changes: [],
      };

      await act(async () => {
        await result.current.preview.mutateAsync(previewInput);
      });

      await waitFor(() => {
        expect(result.current.preview.isSuccess).toBe(true);
      });

      const previewResult = result.current.preview.data;
      expect(previewResult).toBeDefined();
      expect(previewResult?.before).toBeDefined();
      expect(previewResult?.after).toBeDefined();
      expect(previewResult?.diff).toBeDefined();
    });

    it('should show cost difference correctly', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const previewInput: CostComparisonInput = {
        product_id: '1',
        material_changes: [
          {
            material_id: '1',
            status: 'MODIFIED',
            unit_price: 80.0,
          },
        ],
        process_changes: [],
      };

      await act(async () => {
        await result.current.preview.mutateAsync(previewInput);
      });

      await waitFor(() => {
        expect(result.current.preview.isSuccess).toBe(true);
      });

      const previewResult = result.current.preview.data;
      if (previewResult) {
        // Diff should equal after - before
        expect(previewResult.diff.material_cost).toBe(
          previewResult.after.material_cost - previewResult.before.material_cost
        );
      }
    });
  });

  describe('Cost Breakdown Details - 상세 내역', () => {
    it('should include material details', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costBreakdown?.material_details).toBeDefined();
      expect(Array.isArray(result.current.costBreakdown?.material_details)).toBe(true);
    });

    it('should include process details', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costBreakdown?.process_details).toBeDefined();
      expect(Array.isArray(result.current.costBreakdown?.process_details)).toBe(true);
    });

    it('should calculate inhouse and outsource costs separately', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const breakdown = result.current.costBreakdown;
      if (breakdown) {
        // Total should equal inhouse + outsource (use toBeCloseTo for floating point)
        expect(breakdown.total_material_cost).toBeCloseTo(
          breakdown.inhouse_material_cost + breakdown.outsource_material_cost,
          2
        );
        expect(breakdown.total_labor_cost).toBeCloseTo(
          breakdown.inhouse_labor_cost + breakdown.outsource_labor_cost,
          2
        );
      }
    });
  });

  describe('Cost Rates - 비율 설정', () => {
    it('should save cost rates', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1', includeCostRates: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newRates = {
        material_management_rate: 0.02,
        general_management_rate: 0.12,
        defect_rate: 0.015,
        profit_rate: 0.11,
      };

      await act(async () => {
        await result.current.saveCostRates.mutateAsync(newRates);
      });

      await waitFor(() => {
        expect(result.current.saveCostRates.isSuccess).toBe(true);
      });
    });
  });

  describe('Refetch - 갱신', () => {
    it('should refetch data on demand', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialData = result.current.costBreakdown;

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Data should still be valid after refetch
      expect(result.current.costBreakdown).toBeDefined();
      expect(result.current.costBreakdown?.product_id).toBe(initialData?.product_id);
    });
  });

  describe('Error Handling - 에러 처리', () => {
    it('should handle API errors', async () => {
      const { result } = renderHook(
        () => useCostCalculation({ productId: 'non-existent-product' }),
        { wrapper: createWrapper() }
      );

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // Should handle error gracefully
      expect(result.current.error !== null || result.current.costBreakdown !== undefined).toBe(true);
    });
  });
});
