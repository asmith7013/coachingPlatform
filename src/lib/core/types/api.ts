/**
 * API-related type definitions
 */

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface ResourceResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
  message?: string;
} 