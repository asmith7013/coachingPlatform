import { useMemo } from "react";
import { useResourceManager } from "@hooks/utils/useResourceManager";
import { 
  fetchSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from "@/app/actions/schools/schools";
import { School, SchoolInput } from "@/lib/types/core";
import type { ResourceResponse } from "@/lib/data-utilities/pagination/types";
import type { FetchParams } from "@/lib/types/api";

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
    fetchSchools as (params: FetchParams) => Promise<ResourceResponse<School>>,
    createSchool,
    updateSchool,
    deleteSchool,
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
