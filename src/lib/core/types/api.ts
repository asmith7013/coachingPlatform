/**
 * Common type for fetch parameters used across resource hooks
 */
export type FetchParams = {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}; 