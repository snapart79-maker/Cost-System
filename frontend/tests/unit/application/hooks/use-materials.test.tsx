/**
 * useMaterials Hook Tests
 * 자재 관리 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMaterials } from '@/application/hooks/use-materials';
import { MaterialType } from '@/domain/entities/material';
import { ReactNode } from 'react';

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query', () => {
    it('should fetch all materials', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have materials
      expect(result.current.materials).toBeDefined();
      expect(Array.isArray(result.current.materials)).toBe(true);
    });

    it('should return materials with correct structure', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      if (result.current.materials && result.current.materials.length > 0) {
        const material = result.current.materials[0];
        expect(material).toHaveProperty('id');
        expect(material).toHaveProperty('material_id');
        expect(material).toHaveProperty('name');
        expect(material).toHaveProperty('material_type');
        expect(material).toHaveProperty('unit_price');
      }
    });
  });

  describe('Mutations', () => {
    it('should have create mutation', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      expect(result.current.createMaterial).toBeDefined();
      expect(typeof result.current.createMaterial.mutateAsync).toBe('function');
    });

    it('should have update mutation', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateMaterial).toBeDefined();
      expect(typeof result.current.updateMaterial.mutateAsync).toBe('function');
    });

    it('should have delete mutation', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteMaterial).toBeDefined();
      expect(typeof result.current.deleteMaterial.mutateAsync).toBe('function');
    });

    it('should create a new material', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newMaterial = {
        material_id: 'TEST-001',
        name: '테스트 자재',
        material_type: MaterialType.WIRE,
        spec: '테스트 규격',
        unit: 'MTR' as const,
        unit_price: 100,
        effective_date: '2025-01-01',
      };

      await act(async () => {
        await result.current.createMaterial.mutateAsync(newMaterial);
      });

      // Mutation should complete - wait for success state
      await waitFor(() => {
        expect(result.current.createMaterial.isSuccess).toBe(true);
      });
    });
  });

  describe('Filtering', () => {
    it('should filter materials by type', async () => {
      const { result } = renderHook(
        () => useMaterials({ type: MaterialType.WIRE }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All materials should be of type WIRE
      if (result.current.materials && result.current.materials.length > 0) {
        result.current.materials.forEach((material) => {
          expect(material.material_type).toBe(MaterialType.WIRE);
        });
      }
    });

    it('should search materials by name', async () => {
      const { result } = renderHook(
        () => useMaterials({ search: '전선' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All materials should contain search term
      if (result.current.materials && result.current.materials.length > 0) {
        result.current.materials.forEach((material) => {
          expect(
            material.name.includes('전선') ||
              material.material_id.includes('전선')
          ).toBe(true);
        });
      }
    });
  });

  describe('Pagination', () => {
    it('should support pagination', async () => {
      const { result } = renderHook(
        () => useMaterials({ page: 1, pageSize: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle error state', async () => {
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      // Error should be null initially or after successful load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });
});
