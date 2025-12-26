/**
 * useProducts Hook
 * 완제품 관리 훅 - TanStack Query 기반
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductRepositoryImpl } from '@/infrastructure/repositories/product.repository.impl';
import type { Product, ProductStatus } from '@/domain/entities/product';

const repository = new ProductRepositoryImpl();

export interface UseProductsOptions {
  status?: ProductStatus;
  customerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface UseProductsResult {
  products: Product[] | undefined;
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
  getProduct: (id: string) => Promise<Product>;
  createProduct: ReturnType<typeof useMutation<Product, Error, Omit<Product, 'id' | 'created_at' | 'updated_at'>>>;
  updateProduct: ReturnType<typeof useMutation<Product, Error, { id: string; data: Partial<Product> }>>;
  deleteProduct: ReturnType<typeof useMutation<void, Error, string>>;
}

const QUERY_KEY = 'products';

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const {
    status,
    customerId,
    search,
    page = 1,
    pageSize = 20,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Query for fetching products
  const query = useQuery({
    queryKey: [QUERY_KEY, { status, customerId, search, page, pageSize }],
    queryFn: async () => {
      const products = await repository.getAll();

      // Client-side filtering
      let filtered = products;

      if (status) {
        filtered = filtered.filter(p => p.status === status);
      }

      if (customerId) {
        filtered = filtered.filter(p => p.customer_name === customerId);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.product_id.toLowerCase().includes(searchLower) ||
          (p.customer_name && p.customer_name.toLowerCase().includes(searchLower))
        );
      }

      return filtered;
    },
    enabled,
  });

  // Get single product
  const getProduct = async (id: string): Promise<Product> => {
    return repository.getById(id);
  };

  // Create mutation
  const createProduct = useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      return repository.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Update mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      return repository.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Delete mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      return repository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    products: query.data,
    isLoading: query.isLoading,
    error: query.error,
    pagination: query.data ? {
      page,
      pageSize,
      total: query.data.length,
      totalPages: Math.ceil(query.data.length / pageSize),
    } : undefined,
    refetch: query.refetch,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export default useProducts;
