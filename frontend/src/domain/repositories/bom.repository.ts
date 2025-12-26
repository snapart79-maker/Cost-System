/**
 * BOM Repository Interface
 * BOM 데이터 접근 인터페이스
 */

import type {
  Bom,
  BomItem,
  BomSummary,
  BomBulkUpdateInput,
} from '../entities/bom';

export interface IBomRepository {
  /**
   * 완제품별 BOM 전체 조회
   */
  getByProduct(productId: string): Promise<Bom>;

  /**
   * 완제품별 BOM 항목 조회
   */
  getByProductId(productId: string): Promise<BomItem[]>;

  /**
   * BOM 요약 정보 조회
   */
  getSummary(productId: string): Promise<BomSummary>;

  /**
   * BOM 항목 추가
   */
  create(data: Omit<BomItem, 'id' | 'created_at' | 'updated_at'>): Promise<BomItem>;

  /**
   * BOM 항목 수정
   */
  update(id: string, data: Partial<BomItem>): Promise<BomItem>;

  /**
   * BOM 항목 삭제
   */
  delete(id: string): Promise<void>;

  /**
   * BOM 일괄 수정
   */
  bulkUpdate(productId: string, data: BomBulkUpdateInput): Promise<Bom>;
}
