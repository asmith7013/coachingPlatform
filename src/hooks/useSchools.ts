import { useState } from "react";
import { useResourceManager } from "@hooks/utils/useResourceManager";
import { fetchSchools, createSchool, updateSchool, deleteSchool } from "@/app/actions/schools/schools";
import { School } from "@/lib/zod-schema";

export function useSchools(initialPage: number = 1, initialLimit: number = 20) {
  const [performanceMode, setPerformanceMode] = useState(true);

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
  } = useResourceManager<School>(
    "schools",
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    {
      initialPage,
      initialLimit,
      defaultSortOrder: "desc"
    }
  );

  const togglePerformanceMode = () => {
    setPerformanceMode(prev => !prev);
  };

  return {
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
    mutate,
    performanceMode,
    togglePerformanceMode,
  };
}
