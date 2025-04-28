import { useMemo } from "react";
import { useResourceManager } from "@/hooks/data/useResourceManager";
import { 
  fetchSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from "@actions/schools/schools";
import { School, SchoolInput } from "@zod-schema/core/school";
import type { PaginatedResponse } from "@core-types/response";
import type { FetchParams } from "@core-types/api";

export function useSchools(initialPage: number = 1, initialLimit: number = 20) {
  const {
    items: schools,
    total,
    isLoading: loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    applyFilters,
    sortBy,
    changeSorting,
    add: addSchool,
    edit: editSchool,
    remove: removeSchool,
    mutate
  } = useResourceManager<School, SchoolInput>(
    "schools",
    fetchSchools as (params: FetchParams) => Promise<PaginatedResponse<School>>,
    createSchool as (data: SchoolInput) => Promise<{ success: boolean; [key: string]: unknown }>,
    updateSchool as (id: string, data: SchoolInput) => Promise<{ success: boolean; [key: string]: unknown }>,
    deleteSchool as (id: string) => Promise<{ success: boolean; [key: string]: unknown }>,
    {
      initialPage,
      initialLimit,
      defaultSortOrder: "desc"
    }
  );

  // Memoize the return object to prevent reference instability
  return useMemo(() => ({
    schools,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    filters,
    applyFilters,
    sortBy,
    changeSorting,
    addSchool,
    editSchool,
    removeSchool,
    mutate
  }), [
    schools, loading, error,
    page, setPage, limit, setLimit, total,
    filters, applyFilters, sortBy, changeSorting,
    addSchool, editSchool, removeSchool, mutate
  ]);
}
