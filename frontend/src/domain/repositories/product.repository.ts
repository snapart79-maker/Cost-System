/**
 * Product Repository Interface
 * 완제품 데이터 접근 인터페이스
 */

import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductStatus,
} from '../entities/product';
import type { BaseRepository } from './base.repository';

export interface IProductRepository
  extends BaseRepository<Product, ProductCreateInput, ProductUpdateInput> {
  /**
   * 상태별 조회
   */
  getByStatus(status: ProductStatus): Promise<Product[]>;

  /**
   * 고객사별 조회
   */
  getByCustomer(customerName: string): Promise<Product[]>;

  /**
   * 완제품 검색 (품번, 품명, 고객품번)
   */
  search(query: string): Promise<Product[]>;
}
