import { useMemo } from "react";
import { useResourceManager } from "@hooks/utils/useResourceManager";
import { 
  fetchNYCPSStaff, 
  createNYCPSStaff, 
  updateNYCPSStaff, 
  deleteNYCPSStaff
} from "@actions/staff/nycps";
import { NYCPSStaff, NYCPSStaffInput } from "@/lib/types/core";
import type { ResourceResponse } from "@/lib/data-utilities/pagination/types";
import type { FetchParams } from "@/lib/types/api";

export function useNYCPSStaff(initialPage: number = 1, initialLimit: number = 20) {
  const {
    items: staff,
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
    add: addStaff,
    edit: editStaff,
    remove: removeStaff,
    mutate
  } = useResourceManager<NYCPSStaff, NYCPSStaffInput>(
    "nycpsStaff",
    fetchNYCPSStaff as (params: FetchParams) => Promise<ResourceResponse<NYCPSStaff>>,
    createNYCPSStaff,
    updateNYCPSStaff,
    deleteNYCPSStaff,
    {
      initialPage,
      initialLimit,
      defaultSortOrder: "desc"
    }
  );

  // Memoize the return object to prevent reference instability
  return useMemo(() => ({
    staff,
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
    addStaff,
    editStaff,
    removeStaff,
    mutate
  }), [
    staff, loading, error,
    page, setPage, limit, setLimit, total,
    filters, applyFilters, sortBy, changeSorting,
    addStaff, editStaff, removeStaff, mutate
  ]);
} 