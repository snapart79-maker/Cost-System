/**
 * Process Repository Interface
 * 공정 데이터 접근 인터페이스
 */

import type { Process, ProcessCreateInput, ProcessUpdateInput, WorkType } from '../entities';
import type { BaseRepository } from './base.repository';

export interface IProcessRepository
  extends BaseRepository<Process, ProcessCreateInput, ProcessUpdateInput> {
  /**
   * 작업 유형별 조회 (내작/외작)
   */
  getByWorkType(workType: WorkType): Promise<Process[]>;

  /**
   * 공정 일괄 수정
   */
  bulkUpdate(processes: Array<{ id: string } & ProcessUpdateInput>): Promise<Process[]>;

  /**
   * 공정 검색 (공정코드, 공정명)
   */
  search(query: string): Promise<Process[]>;
}
