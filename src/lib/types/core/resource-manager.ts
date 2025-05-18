import { CollectionResponse } from '@core-types/response';
import type { QueryParams } from "@core-types/query";
// import { BaseDocument } from "@core-types/document";

// Type helper to work with both MongoDB style _id and normalized id
export type WithId<T> = T & { id: string } | T & { _id: string };

export type FetchFunction<T> = (params: QueryParams) => Promise<CollectionResponse<T>>;

export interface ResourceManagerOptions {
  initialPage?: number;
  initialLimit?: number;
  defaultSortOrder?: "asc" | "desc";
  debug?: boolean;
}

export interface ResourceManagerResult<T extends WithId<Record<string, unknown>>, I> {
  // Data state
  items: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  
  // Filtering and sorting
  filters: Record<string, unknown>; // Changed from Partial<T> to match useFiltersAndSorting
  applyFilters: (filters: Record<string, unknown>) => void; // Changed parameter type
  sortBy: string;
  changeSorting: (field: keyof T, direction: "asc" | "desc") => void;
  
  // CRUD operations
  add: (data: I) => Promise<T | undefined>;
  edit: (id: string, data: I) => Promise<T | undefined>;
  remove: (id: string) => Promise<boolean>;
  mutate: () => Promise<unknown>;
}

// Helper to get ID value regardless of property name
export function getId(item: { id: string } | { _id: string }): string {
  return 'id' in item ? item.id : item._id;
}