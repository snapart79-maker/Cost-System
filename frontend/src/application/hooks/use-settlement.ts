/**
 * useSettlement Hook
 * 정산 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementRepository } from '@/infrastructure/repositories/settlement.repository.impl';
import type { SettlementQueryOptions } from '@/domain/repositories/settlement.repository';
import type {
  Settlement,
  SettlementCalculateInput,
  SettlementSaveInput,
  SettlementResult,
} from '@/domain/entities/settlement';
import type { PaginatedResult } from '@/domain/repositories/base.repository';

const QUERY_KEY = 'settlements';

export function useSettlement() {
  const queryClient = useQueryClient();

  /**
   * 정산 이력 조회 훅
   */
  const useSettlementHistory = (options?: SettlementQueryOptions) => {
    return useQuery<PaginatedResult<Settlement>>({
      queryKey: [QUERY_KEY, 'history', options],
      queryFn: () => settlementRepository.getHistory(options),
    });
  };

  /**
   * 정산 상세 조회 훅
   */
  const useSettlementById = (id?: string) => {
    return useQuery<Settlement>({
      queryKey: [QUERY_KEY, 'detail', id],
      queryFn: () => {
        if (!id) throw new Error('ID is required');
        return settlementRepository.getById(id);
      },
      enabled: !!id,
    });
  };

  /**
   * 정산 요약 조회 훅 (대시보드용)
   */
  const useSettlementSummary = () => {
    return useQuery<{
      pending_count: number;
      total_amount: number;
      this_month_count: number;
    }>({
      queryKey: [QUERY_KEY, 'summary'],
      queryFn: () => settlementRepository.getSummary(),
    });
  };

  /**
   * 정산 계산 mutation
   */
  const useCalculateSettlement = () => {
    return useMutation<SettlementResult[], Error, SettlementCalculateInput>({
      mutationFn: (data) => settlementRepository.calculate(data),
    });
  };

  /**
   * 정산 저장 mutation
   */
  const useSaveSettlement = () => {
    return useMutation<Settlement, Error, SettlementSaveInput>({
      mutationFn: (data) => settlementRepository.save(data),
      onSuccess: () => {
        // 저장 성공 시 이력 및 요약 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'history'] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'summary'] });
      },
    });
  };

  return {
    useSettlementHistory,
    useSettlementById,
    useSettlementSummary,
    useCalculateSettlement,
    useSaveSettlement,
  };
}

export default useSettlement;
