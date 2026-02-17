import { useState, useCallback } from "react";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { buildQueryParams } from "@/lib/data-processing/pagination/pagination-utils";

/**
 * Hook to manage query state consistently across paginated queries
 */

export function usePaginationState(initialParams: Partial<QueryParams> = {}) {
  // Build full params with defaults
  const [queryParams, setQueryParams] = useState(() =>
    buildQueryParams({
      ...DEFAULT_QUERY_PARAMS,
      ...initialParams,
    }),
  );

  // Extract commonly used values
  const { page, limit, sortBy, sortOrder, filters, search } = queryParams;

  // Update the entire query params object
  const updateQueryParams = useCallback((newParams: Partial<QueryParams>) => {
    setQueryParams((prev) =>
      buildQueryParams({
        ...prev,
        ...newParams,
      }),
    );
  }, []);

  // Individual updater functions
  const setPage = useCallback(
    (newPage: number) => {
      updateQueryParams({ page: newPage });
    },
    [updateQueryParams],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      updateQueryParams({
        limit: newPageSize,
        // Reset to page 1 when changing page size
        page: 1,
      });
    },
    [updateQueryParams],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      updateQueryParams({
        search: newSearch,
        // Reset to page 1 when changing search
        page: 1,
      });
    },
    [updateQueryParams],
  );

  const applyFilters = useCallback(
    (newFilters: Record<string, unknown>) => {
      updateQueryParams({
        filters: newFilters,
        // Reset to page 1 when changing filters
        page: 1,
      });
    },
    [updateQueryParams],
  );

  const changeSorting = useCallback(
    (newSortBy: string, newSortOrder?: "asc" | "desc") => {
      updateQueryParams({
        sortBy: newSortBy,
        sortOrder:
          newSortOrder ||
          (newSortBy === sortBy && sortOrder === "asc" ? "desc" : "asc"),
      });
    },
    [updateQueryParams, sortBy, sortOrder],
  );

  return {
    // Current state
    queryParams,
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    search,

    // Updaters
    updateQueryParams,
    setPage,
    setPageSize,
    setSearch,
    applyFilters,
    changeSorting,
  };
}
