"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// import { Card } from '@components/composed/cards/Card';
// import { Input } from '@components/core/fields/Input';
// import { Button } from '@components/core/Button';
// import { Checkbox } from '@components/core/fields/Checkbox';
// import { Alert } from '@components/core/feedback/Alert';
// import { Spinner } from '@components/core/feedback/Spinner';
// import { Heading } from '@components/core/typography/Heading';
// import { Text } from '@components/core/typography/Text';
// import type { VisitInput } from '@zod-schema/visits/visit';
import type { ImportPreview } from "@lib/integrations/monday/types/import";
import {
  useMondayBoard,
  useMondayPreviews,
  useMondayImport,
} from "@hooks/integrations/monday/useMondayQueries";

/**
 * Monday Visit Selection Page
 * This page allows users to select visits from Monday.com to import
 */
export default function MondayVisitSelectionPage() {
  const router = useRouter();

  // State
  const [boardId, _setBoardId] = useState<string>("");
  const [_error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [filteredPreviews, setFilteredPreviews] = useState<ImportPreview[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // React Query hooks
  const boardMutation = useMondayBoard();
  const importMutation = useMondayImport();
  const previewsQuery = useMondayPreviews(boardId || null);

  // Filter state
  const [searchTerm, _setSearchTerm] = useState("");
  const [showDuplicates, _setShowDuplicates] = useState(true);
  const [showInvalid, _setShowInvalid] = useState(true);

  // Update local error state when hook errors change
  useEffect(() => {
    const queryError =
      previewsQuery.error || boardMutation.error || importMutation.error;
    if (queryError) {
      setError(
        queryError instanceof Error ? queryError.message : String(queryError),
      );
    }
  }, [previewsQuery.error, boardMutation.error, importMutation.error]);

  // Update previews when data changes
  useEffect(() => {
    if (previewsQuery.data) {
      setPreviews(previewsQuery.data);
    }
  }, [previewsQuery.data]);

  // Fetch visit previews when board ID changes
  const _fetchPreviews = useCallback(async () => {
    if (!boardId) {
      setError("Please enter a board ID");
      return;
    }

    setError(null);

    try {
      // This will trigger the previewsQuery by setting the boardId state
      boardMutation.mutate([boardId]);
    } catch (err) {
      console.error("Error fetching previews:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [boardId, boardMutation]);

  // Apply filters when filter state or previews change
  useEffect(() => {
    // Apply filters to previews
    const filtered = previews.filter((preview) => {
      const name = preview.original?.name || "";
      const matchesSearch = searchTerm
        ? (name as string).toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesDuplicate = !preview.isDuplicate || showDuplicates;
      const matchesValid = preview.valid !== false || showInvalid;

      return matchesSearch && matchesDuplicate && matchesValid;
    });

    setFilteredPreviews(filtered);
  }, [previews, searchTerm, showDuplicates, showInvalid]);

  // Handle preview selection
  const _togglePreviewSelection = useCallback((previewId: string) => {
    setSelectedItems((prev) => {
      // If already selected, remove it
      if (prev.includes(previewId)) {
        return prev.filter((id) => id !== previewId);
      }

      // Otherwise, add it
      return [...prev, previewId];
    });
  }, []);

  // Handle import initiation - Using React Query mutation
  const _handleImport = useCallback(async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one visit to import");
      return;
    }

    setError(null);

    try {
      // Use the import mutation from React Query
      const result = await importMutation.mutateAsync({
        ids: selectedItems,
        boardId,
      });

      // If we need to complete data for a single item
      if (result.completionRequired && result.completionData) {
        // Format URL parameters
        const params = new URLSearchParams();
        params.set("visitData", JSON.stringify(result.completionData));
        params.set(
          "missingFields",
          JSON.stringify(result.completionData.missingFields || []),
        );
        params.set("boardId", boardId);

        // Navigate to the completion page
        router.push(`/integrations/monday/visits/import?${params.toString()}`);
      } else if (result.redirectUrl) {
        // Navigate to the specified redirect URL
        router.push(result.redirectUrl);
      } else {
        // Navigate to visits dashboard by default
        router.push("/dashboard/visits");
      }
    } catch (err) {
      console.error("Error importing visits:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [selectedItems, boardId, router, importMutation]);

  // Toggle select all
  const _toggleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredPreviews.length) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all valid items
      setSelectedItems(
        filteredPreviews
          .filter((preview) => preview.valid)
          .map((preview) => preview.original.id as string),
      );
    }
  }, [filteredPreviews, selectedItems.length]);

  // Reset filters
  // const resetFilters = useCallback(() => {
  //   setSearchTerm('');
  //   setShowDuplicates(true);
  //   setShowInvalid(true);
  // }, []);

  // Determine loading state from React Query hooks
  // const isLoading = previewsQuery.isLoading || importMutation.isPending;

  return <div className="container mx-auto py-6"></div>;
}
