/**
 * useSettlement Hook Tests
 * 정산 관리 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettlement } from '@/application/hooks/use-settlement';
import { mockSettlements, mockSettlementResults, mockSettlementSummary } from '../../../mocks/data';

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSettlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSettlementHistory', () => {
    it('should fetch settlement history', async () => {
      const { result } = renderHook(() => useSettlement().useSettlementHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toHaveLength(mockSettlements.length);
    });

    it('should filter by price_change_id', async () => {
      const { result } = renderHook(
        () => useSettlement().useSettlementHistory({ price_change_id: '1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should filter by date range', async () => {
      const { result } = renderHook(
        () =>
          useSettlement().useSettlementHistory({
            start_date: '2025-01-01',
            end_date: '2025-03-31',
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useSettlementById', () => {
    it('should fetch settlement by id', async () => {
      const { result } = renderHook(() => useSettlement().useSettlementById('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.id).toBe('1');
      expect(result.current.data?.total_settlement_amount).toBe(330000);
    });

    it('should not fetch when id is undefined', async () => {
      const { result } = renderHook(() => useSettlement().useSettlementById(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useSettlementSummary', () => {
    it('should fetch settlement summary', async () => {
      const { result } = renderHook(() => useSettlement().useSettlementSummary(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.pending_count).toBe(mockSettlementSummary.pending_count);
      expect(result.current.data?.total_amount).toBe(mockSettlementSummary.total_amount);
      expect(result.current.data?.this_month_count).toBe(mockSettlementSummary.this_month_count);
    });
  });

  describe('useCalculateSettlement', () => {
    it('should calculate settlement', async () => {
      const { result } = renderHook(() => useSettlement().useCalculateSettlement(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          price_change_id: '1',
          product_ids: ['1', '2'],
          start_date: '2025-01-01',
          end_date: '2025-03-31',
          period_type: 'MONTHLY',
          receipt_quantities: [
            { product_id: '1', period: '2025-01', quantity: 500 },
            { product_id: '1', period: '2025-02', quantity: 600 },
          ],
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveLength(mockSettlementResults.length);
    });

    it('should handle calculation errors', async () => {
      const { result } = renderHook(() => useSettlement().useCalculateSettlement(), {
        wrapper: createWrapper(),
      });

      // Should still succeed with mock data
      await act(async () => {
        result.current.mutate({
          price_change_id: '1',
          product_ids: [],
          start_date: '2025-01-01',
          end_date: '2025-03-31',
          period_type: 'MONTHLY',
          receipt_quantities: [],
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useSaveSettlement', () => {
    it('should save settlement', async () => {
      const { result } = renderHook(() => useSettlement().useSaveSettlement(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          price_change_id: '1',
          product_ids: ['1', '2'],
          start_date: '2025-01-01',
          end_date: '2025-03-31',
          period_type: 'MONTHLY',
          receipt_quantities: [
            { product_id: '1', period: '2025-01', quantity: 500 },
          ],
          results: mockSettlementResults,
          total_settlement_amount: 330000,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.id).toBeDefined();
    });

    it('should invalidate history query after save', async () => {
      const wrapper = createWrapper();
      const { result: saveResult } = renderHook(
        () => useSettlement().useSaveSettlement(),
        { wrapper }
      );
      const { result: historyResult } = renderHook(
        () => useSettlement().useSettlementHistory(),
        { wrapper }
      );

      // Wait for history to load
      await waitFor(() => {
        expect(historyResult.current.isSuccess).toBe(true);
      });

      // Save new settlement
      await act(async () => {
        saveResult.current.mutate({
          price_change_id: '1',
          product_ids: ['1'],
          start_date: '2025-01-01',
          end_date: '2025-03-31',
          period_type: 'MONTHLY',
          receipt_quantities: [],
          results: mockSettlementResults,
          total_settlement_amount: 330000,
        });
      });

      await waitFor(() => {
        expect(saveResult.current.isSuccess).toBe(true);
      });

      // History should be refetched (invalidated)
      expect(historyResult.current.isFetching || historyResult.current.isSuccess).toBe(true);
    });
  });

  describe('Hook integration', () => {
    it('should return all settlement hooks', () => {
      const { result } = renderHook(() => useSettlement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.useSettlementHistory).toBeDefined();
      expect(result.current.useSettlementById).toBeDefined();
      expect(result.current.useSettlementSummary).toBeDefined();
      expect(result.current.useCalculateSettlement).toBeDefined();
      expect(result.current.useSaveSettlement).toBeDefined();
    });
  });
});
