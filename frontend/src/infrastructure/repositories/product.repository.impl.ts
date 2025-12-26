/**
 * Product Repository Implementation
 * 완제품 데이터 접근 구현체
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { handleApiCall } from '@/shared/utils/api-error';
import type { IProductRepository } from '@/domain/repositories/product.repository';
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductStatus,
} from '@/domain/entities/product';

export class ProductRepositoryImpl implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const response = await handleApiCall(apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS));
    return response.data;
  }

  async getById(id: string): Promise<Product> {
    const response = await handleApiCall(
      apiClient.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id))
    );
    return response.data;
  }

  async getByStatus(status: ProductStatus): Promise<Product[]> {
    const response = await handleApiCall(
      apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, {
        params: { status },
      })
    );
    return response.data;
  }

  async getByCustomer(customerName: string): Promise<Product[]> {
    const response = await handleApiCall(
      apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, {
        params: { customer_name: customerName },
      })
    );
    return response.data;
  }

  async create(data: ProductCreateInput): Promise<Product> {
    const response = await handleApiCall(
      apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data)
    );
    return response.data;
  }

  async update(id: string, data: ProductUpdateInput): Promise<Product> {
    const response = await handleApiCall(
      apiClient.put<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), data)
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await handleApiCall(apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id)));
  }

  async search(query: string): Promise<Product[]> {
    const response = await handleApiCall(
      apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, {
        params: { search: query },
      })
    );
    return response.data;
  }
}

// Singleton instance
export const productRepository = new ProductRepositoryImpl();
