/**
 * Base Repository Interface
 * 공통 CRUD 인터페이스 정의
 */

export interface BaseRepository<T, CreateInput, UpdateInput> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface QueryOptions {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}
