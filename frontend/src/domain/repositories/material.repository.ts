/**
 * Material Repository Interface
 * 자재 데이터 접근 인터페이스
 */

import type {
  Material,
  MaterialCreateInput,
  MaterialUpdateInput,
  MaterialType,
} from '../entities/material';
import type { BaseRepository } from './base.repository';

export interface IMaterialRepository
  extends BaseRepository<Material, MaterialCreateInput, MaterialUpdateInput> {
  /**
   * 자재 유형별 조회
   */
  getByType(type: MaterialType): Promise<Material[]>;

  /**
   * 자재 일괄 수정
   */
  bulkUpdate(materials: Array<{ id: string } & MaterialUpdateInput>): Promise<Material[]>;

  /**
   * 자재 검색 (품번, 품명)
   */
  search(query: string): Promise<Material[]>;
}
