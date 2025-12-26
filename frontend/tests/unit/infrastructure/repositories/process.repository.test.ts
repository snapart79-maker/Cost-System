/**
 * Process Repository Tests
 * 공정 Repository 테스트
 */

import { describe, it, expect } from 'vitest';
import { ProcessRepositoryImpl } from '@/infrastructure/repositories/process.repository.impl';
import { WorkType } from '@/domain/entities/process';

describe('ProcessRepository', () => {
  const repository = new ProcessRepositoryImpl();

  describe('getAll', () => {
    it('should fetch all processes', async () => {
      const processes = await repository.getAll();

      expect(processes).toHaveLength(3);
      expect(processes[0].process_id).toBe('CUT-001');
    });
  });

  describe('getById', () => {
    it('should fetch a process by id', async () => {
      const process = await repository.getById('1');

      expect(process.id).toBe('1');
      expect(process.name).toBe('절단압착');
      expect(process.work_type).toBe(WorkType.IN_HOUSE);
    });
  });

  describe('getByWorkType', () => {
    it('should fetch inhouse processes', async () => {
      const inhouse = await repository.getByWorkType(WorkType.IN_HOUSE);

      expect(inhouse.length).toBeGreaterThan(0);
      expect(inhouse.every((p) => p.work_type === WorkType.IN_HOUSE)).toBe(true);
    });

    it('should fetch outsource processes', async () => {
      const outsource = await repository.getByWorkType(WorkType.OUTSOURCE);

      expect(outsource.length).toBeGreaterThan(0);
      expect(outsource.every((p) => p.work_type === WorkType.OUTSOURCE)).toBe(true);
    });
  });
});
