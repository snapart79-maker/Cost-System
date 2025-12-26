/**
 * Cost Calculation Repository Tests
 * 원가 계산 Repository 테스트
 */

import { describe, it, expect } from 'vitest';
import { CostCalculationRepositoryImpl } from '@/infrastructure/repositories/cost-calculation.repository.impl';

describe('CostCalculationRepository', () => {
  const repository = new CostCalculationRepositoryImpl();

  describe('getBreakdown', () => {
    it('should fetch cost breakdown for a product', async () => {
      const breakdown = await repository.getBreakdown('1');

      expect(breakdown.product_id).toBe('1');
      expect(breakdown.total_material_cost).toBe(1802.45);
      expect(breakdown.total_labor_cost).toBe(469.12);
      expect(breakdown.total_expense).toBe(323.57);
      expect(breakdown.total_manufacturing_cost).toBe(2595.14);
      expect(breakdown.total_purchase_cost).toBe(2805.58);
    });
  });

  describe('calculate', () => {
    it('should calculate cost for a product', async () => {
      const result = await repository.calculate('1');

      expect(result.product_id).toBe('1');
      expect(result.total_purchase_cost).toBeGreaterThan(0);
    });
  });

  describe('preview', () => {
    it('should preview cost changes', async () => {
      const result = await repository.preview({
        product_id: '1',
        material_changes: [
          { material_id: '1', status: 'MODIFIED', unit_price: 70 },
        ],
        process_changes: [],
      });

      expect(result.before).toBeDefined();
      expect(result.after).toBeDefined();
      expect(result.diff).toBeDefined();
      expect(result.diff.material_cost).toBe(100);
      expect(result.diff.purchase_cost).toBe(156);
    });
  });

  describe('getCostRates', () => {
    it('should fetch cost rate settings', async () => {
      const rates = await repository.getCostRates();

      expect(rates.material_management_rate).toBe(0.01);
      expect(rates.general_management_rate).toBe(0.1);
      expect(rates.defect_rate).toBe(0.01);
      expect(rates.profit_rate).toBe(0.1);
    });
  });
});
