import { ResourceResponse } from '@core-types/response';
import type { FetchParams } from "@core-types/api";
// import { BaseDocument } from "@core-types/document";

// Type helper to work with both MongoDB style _id and normalized id
export type WithId<T> = T & { id: string } | T & { _id: string };

export type FetchFunction<T> = (params: FetchParams) => Promise<ResourceResponse<T>>;

export interface ResourceManagerOptions {
  initialPage?: number;
  initialLimit?: number;
  defaultSortOrder?: "asc" | "desc";
  debug?: boolean;
}

export interface ResourceManagerResult<T extends WithId<Record<string, unknown>>, I> {
  // Data and loading state
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
  filters: Partial<T>;
  applyFilters: (filters: Partial<T>) => void;
  sortBy: string;
  changeSorting: (field: keyof T, direction: "asc" | "desc") => void;
  
  // CRUD operations
  add: (data: I) => Promise<{ success: boolean; [key: string]: unknown }>;
  edit: (id: string, data: I) => Promise<{ success: boolean; [key: string]: unknown }>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  mutate: () => Promise<ResourceResponse<T> | undefined>;
}

// Helper to get ID value regardless of property name
export function getId(item: { id: string } | { _id: string }): string {
  return 'id' in item ? item.id : item._id;
}