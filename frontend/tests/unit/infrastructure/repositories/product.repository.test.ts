/**
 * Product Repository Tests
 * 완제품 Repository 테스트
 */

import { describe, it, expect } from 'vitest';
import { ProductRepositoryImpl } from '@/infrastructure/repositories/product.repository.impl';
import { ProductStatus } from '@/domain/entities/product';

describe('ProductRepository', () => {
  const repository = new ProductRepositoryImpl();

  describe('getAll', () => {
    it('should fetch all products', async () => {
      const products = await repository.getAll();

      expect(products).toHaveLength(3);
      expect(products[0].product_id).toBe('WH-001');
    });
  });

  describe('getById', () => {
    it('should fetch a product by id', async () => {
      const product = await repository.getById('1');

      expect(product.id).toBe('1');
      expect(product.name).toBe('와이어 하네스 A');
      expect(product.customer_name).toBe('현대자동차');
      expect(product.status).toBe(ProductStatus.PRODUCTION);
    });
  });
});
