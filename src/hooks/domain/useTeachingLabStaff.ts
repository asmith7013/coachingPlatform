import { useState, useCallback } from "react";
import useSWR from "swr";
import { 
  fetchTeachingLabStaff
} from "@/app/actions/staff";

interface UseTeachingLabStaffOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface FilterObject {
  staffName?: string;
  [key: string]: unknown;
}

export function useTeachingLabStaff({ 
  initialPage = 1, 
  initialLimit = 10 
}: UseTeachingLabStaffOptions = {}) {
  // Local state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<FilterObject>({});
  
  // Build query params
  const params = {
    page,
    limit,
    ...filters
  };
  
  // Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    ['teachingLabStaff', JSON.stringify(params)],
    async () => {
      try {
        return await fetchTeachingLabStaff(params);
      } catch (err) {
        console.error("Error fetching teaching lab staff:", err);
        throw err;
      }
    }
  );
  
  // Apply filters
  const applyFilters = useCallback((newFilters: FilterObject) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Reset to first page when filters change
    setPage(1);
  }, []);
  
  return {
    staff: data?.items || [],
    loading: isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total: data?.total || 0,
    filters,
    applyFilters,
    mutate
  };
} 