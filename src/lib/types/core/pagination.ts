import { z } from 'zod';
import { 
  PaginationParamsZodSchema,
  PaginatedResponseZodSchema 
} from '@/lib/data-schema/zod-schema/core-types/query';

// Derive pagination params type from Zod schema
export type PaginationParams = z.infer<typeof PaginationParamsZodSchema>;

// Derive paginated response type with generic support
export type PaginatedResponse<T = unknown> = Omit<z.infer<typeof PaginatedResponseZodSchema>, 'items'> & {
  items: T[];
};

// Constants and utility functions
export const DEFAULT_PAGINATION_PARAMS: Required<PaginationParams> = {
  page: 1,
  limit: 10,
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isEmpty: boolean;
}

export function buildPaginationParams(
  params: Partial<PaginationParams> = {}
): Required<PaginationParams> {
  const {
    page = DEFAULT_PAGINATION_PARAMS.page,
    limit = DEFAULT_PAGINATION_PARAMS.limit,
  } = params;

  return {
    page,
    limit,
  };
}

export function calculatePaginationMeta(
  total: number,
  params: Required<PaginationParams>
): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    isEmpty: total === 0
  };
}

export function calculateSkip(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

// For backward compatibility
export type PaginationOptions = PaginationParams;
export const DEFAULT_PAGINATION_OPTIONS = DEFAULT_PAGINATION_PARAMS;