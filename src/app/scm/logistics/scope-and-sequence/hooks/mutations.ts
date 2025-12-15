import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createScopeAndSequence,
  updateScopeAndSequence,
  deleteScopeAndSequence,
} from "@actions/scm/scope-and-sequence";
import { scopeSequenceKeys } from "./queries";
import type { ScopeAndSequenceInput } from "@zod-schema/scm/curriculum/scope-and-sequence";

export function useCreateScopeSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScopeAndSequenceInput) => {
      const result = await createScopeAndSequence(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to create entry");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scopeSequenceKeys.all });
    },
  });
}

export function useUpdateScopeSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ScopeAndSequenceInput> }) => {
      const result = await updateScopeAndSequence(id, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update entry");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scopeSequenceKeys.all });
    },
  });
}

export function useDeleteScopeSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteScopeAndSequence(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete entry");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scopeSequenceKeys.all });
    },
  });
}
