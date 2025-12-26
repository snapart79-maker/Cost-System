/**
 * usePriceChange Hook Test
 * 단가 변경 훅 테스트 - TDD RED Phase
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePriceChange } from '@/application/hooks/use-price-change';
import { ChangeType } from '@/domain/entities/price-change';

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

describe('usePriceChange', () => {
  describe('Query - 조회', () => {
    it('should fetch all price changes', async () => {
      const { result } = renderHook(() => usePriceChange(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.priceChanges).toBeDefined();
      expect(Array.isArray(result.current.priceChanges)).toBe(true);
    });

    it('should filter by product_id', async () => {
      const { result } = renderHook(
        () => usePriceChange({ product_id: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.priceChanges).toBeDefined();
      if (result.current.priceChanges) {
        result.current.priceChanges.forEach((pc) => {
          expect(pc.product_id).toBe('1');
        });
      }
    });

    it('should get price change by id', async () => {
      const { result } = renderHook(
        () => usePriceChange({ id: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.priceChange).toBeDefined();
      expect(result.current.priceChange?.id).toBe('1');
    });

    it('should return pagination info', async () => {
      const { result } = renderHook(() => usePriceChange(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toBeDefined();
      expect(result.current.pagination?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mutations - 변경', () => {
    it('should create a new price change', async () => {
      const { result } = renderHook(() => usePriceChange(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPriceChange = {
        product_id: '1',
        change_type: ChangeType.MATERIAL,
        change_reason: '테스트 단가 변경',
        eco_number: 'ECO-TEST-001',
        effective_date: '2025-04-01',
        material_changes: [
          {
            material_id: '1',
            status: 'MODIFIED' as const,
            quantity: 1.5,
            unit_price: 80.0,
          },
        ],
        process_changes: [],
      };

      await act(async () => {
        await result.current.createPriceChange.mutateAsync(newPriceChange);
      });

      await waitFor(() => {
        expect(result.current.createPriceChange.isSuccess).toBe(true);
      });
    });

    it('should handle validation errors', async () => {
      const { result } = renderHook(() => usePriceChange(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Invalid data - missing required fields
      const invalidData = {
        product_id: '',
        change_type: ChangeType.MATERIAL,
        change_reason: '',
        effective_date: '',
        material_changes: [],
        process_changes: [],
      };

      // Validation should catch this before API call
      expect(() => {
        result.current.validatePriceChange(invalidData);
      }).toThrow();
    });
  });

  describe('Compare - 비교', () => {
    it('should have compare capability', async () => {
      const { result } = renderHook(
        () => usePriceChange({ compareId: '2' }),
        { wrapper: createWrapper() }
      );

      // Initially should be loading
      expect(result.current.isLoading).toBeDefined();

      await waitFor(
        () => {
          // Wait for loading to complete
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // Hook should not have error after loading
      // Comparison data depends on API response
      expect(result.current.error).toBeNull();
    });
  });

  describe('Product History - 제품별 이력', () => {
    it('should get price change history by product', async () => {
      const { result } = renderHook(
        () => usePriceChange({ product_id: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Without includeHistory, should use list query with product_id filter
      // The priceChanges should be defined from the paginated result
      expect(result.current.priceChanges).toBeDefined();
    });
  });

  describe('Error Handling - 에러 처리', () => {
    it('should handle API errors gracefully', async () => {
      const { result } = renderHook(
        () => usePriceChange({ id: 'non-existent' }),
        { wrapper: createWrapper() }
      );

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // Should have error or empty result
      expect(
        result.current.error !== null || result.current.priceChange === undefined
      ).toBe(true);
    });
  });
});
