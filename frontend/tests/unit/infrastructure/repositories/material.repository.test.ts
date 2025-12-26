/**
 * Material Repository Tests
 * 자재 Repository 테스트
 */

import { describe, it, expect } from 'vitest';
import { MaterialRepositoryImpl } from '@/infrastructure/repositories/material.repository.impl';
import { MaterialType, MaterialUnit } from '@/domain/entities/material';
import { mockMaterials } from '../../../mocks/data';

describe('MaterialRepository', () => {
  const repository = new MaterialRepositoryImpl();

  describe('getAll', () => {
    it('should fetch all materials', async () => {
      const materials = await repository.getAll();

      expect(materials).toHaveLength(3);
      expect(materials[0].material_id).toBe('AWG20-RED');
    });
  });

  describe('getById', () => {
    it('should fetch a material by id', async () => {
      const material = await repository.getById('1');

      expect(material.id).toBe('1');
      expect(material.name).toBe('전선 (적색)');
      expect(material.material_type).toBe(MaterialType.WIRE);
    });
  });

  describe('getByType', () => {
    it('should fetch materials by type', async () => {
      const wires = await repository.getByType(MaterialType.WIRE);

      expect(wires.length).toBeGreaterThan(0);
      expect(wires.every((m) => m.material_type === MaterialType.WIRE)).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a new material', async () => {
      const newMaterial = await repository.create({
        material_id: 'NEW-001',
        name: '신규 자재',
        material_type: MaterialType.ACCESSORY,
        unit: MaterialUnit.EA,
        unit_price: 100.0,
        effective_date: '2025-01-01',
      });

      expect(newMaterial.id).toBeDefined();
      expect(newMaterial.name).toBe('신규 자재');
    });
  });

  describe('update', () => {
    it('should update a material', async () => {
      const updated = await repository.update('1', {
        name: '전선 (적색) - 수정',
        unit_price: 65.0,
      });

      expect(updated.name).toBe('전선 (적색) - 수정');
      expect(updated.unit_price).toBe(65.0);
    });
  });

  describe('delete', () => {
    it('should delete a material', async () => {
      // Should not throw
      await expect(repository.delete('1')).resolves.toBeUndefined();
    });
  });
});
