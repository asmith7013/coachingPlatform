import { useQuery } from "@tanstack/react-query";
import {
  fetchScopeAndSequence,
  fetchScopeAndSequenceById,
  fetchAllUnitsByScopeTag,
} from "@actions/scm/scope-and-sequence/scope-and-sequence";

export const scopeSequenceKeys = {
  all: ["scope-and-sequence"] as const,
  list: (filters: { grade?: string; unitNumber?: number; scopeSequenceTag?: string }) =>
    [...scopeSequenceKeys.all, "list", filters] as const,
  detail: (id: string) => [...scopeSequenceKeys.all, "detail", id] as const,
  units: (scopeTag: string) => [...scopeSequenceKeys.all, "units", scopeTag] as const,
};

export function useScopeSequenceList(filters: {
  grade?: string;
  unitNumber?: number;
  scopeSequenceTag?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: scopeSequenceKeys.list(filters),
    queryFn: async () => {
      const result = await fetchScopeAndSequence({
        filters: {
          ...(filters.grade && { grade: filters.grade }),
          ...(filters.unitNumber && { unitNumber: filters.unitNumber }),
          ...(filters.scopeSequenceTag && { scopeSequenceTag: filters.scopeSequenceTag }),
        },
        sortBy: "unitNumber",
        sortOrder: "asc",
        limit: filters.limit || 100,
        page: filters.page || 1,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch scope and sequence");
      }
      return result.items;
    },
  });
}

export function useScopeSequenceById(id: string) {
  return useQuery({
    queryKey: scopeSequenceKeys.detail(id),
    queryFn: async () => {
      const result = await fetchScopeAndSequenceById(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch entry");
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useUnitsByScopeTag(scopeTag: string) {
  return useQuery({
    queryKey: scopeSequenceKeys.units(scopeTag),
    queryFn: async () => {
      const result = await fetchAllUnitsByScopeTag(scopeTag);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch units");
      }
      return result.data;
    },
    enabled: !!scopeTag,
  });
}
