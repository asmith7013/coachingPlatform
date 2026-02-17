import { useMemo } from "react";
import { ZodSchema } from "zod";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@query/core/keys";
import { handleClientError } from "@error/handlers/client";
import { BaseDocument } from "@core-types/document";
import { getEntityLabel } from "@query/client/utilities/selector-helpers";

export interface ReferenceOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface UseReferenceDataOptions<T = unknown> {
  /** The URL to fetch reference data from */
  url: string;

  /** Optional search term to filter options */
  search?: string;

  /** Whether to enable the query */
  enabled?: boolean;

  /** Optional schema override - if not provided, will use basic transformation */
  schema?: ZodSchema<T>;

  /** Entity type for selector system */
  entityType?: string;

  /** Custom selector to transform API response to options */
  selector?: (data: unknown) => ReferenceOption[];

  /** Custom fetch function */
  fetcher?: (url: string) => Promise<unknown>;

  /** Additional query options */
  queryOptions?: Omit<
    UseQueryOptions,
    "queryKey" | "queryFn" | "enabled" | "select"
  >;
}

/**
 * Simple function to extract items array from response
 */
function extractItemsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // Check for collection response format
    if ("items" in obj && Array.isArray(obj.items)) {
      return obj.items;
    }

    // Check for entity response format
    if ("data" in obj) {
      const dataValue = obj.data;
      if (Array.isArray(dataValue)) {
        return dataValue;
      }
      if (dataValue && typeof dataValue === "object") {
        return [dataValue];
      }
    }

    // Check for success response format
    if (
      "success" in obj &&
      obj.success &&
      "items" in obj &&
      Array.isArray(obj.items)
    ) {
      return obj.items;
    }
  }

  return [];
}

/**
 * Convert any item to a ReferenceOption format with optional schema validation
 */
function itemToReferenceOption<T extends BaseDocument>(
  item: unknown,
  schema?: ZodSchema<T>,
): ReferenceOption | null {
  try {
    let validated: unknown = item;

    // Use schema validation if available
    if (schema && item && typeof item === "object") {
      const result = schema.safeParse(item);
      validated = result.success ? result.data : item;
    }

    if (!validated || typeof validated !== "object") {
      return null;
    }

    const obj = validated as Record<string, unknown>;

    // Find the best ID field
    const id = obj._id || obj.id || "";

    // Find the best label
    const label = getEntityLabel(obj);

    return {
      value: String(id),
      label: String(label),
      ...obj, // Include all fields for advanced usage
    };
  } catch (error) {
    console.error("Error transforming reference item:", error);
    return null;
  }
}

/**
 * Default selector with optional schema validation
 */
function defaultSelector<T extends BaseDocument>(
  data: unknown,
  schema?: ZodSchema<T>,
): ReferenceOption[] {
  // Extract items array based on response format
  const items = extractItemsArray(data);

  // Transform items to reference options with optional schema validation
  return items
    .map((item) => itemToReferenceOption<T>(item, schema))
    .filter((option): option is ReferenceOption => option !== null);
}

/**
 * Map URL to entity type for selector system
 */
function getEntityTypeFromUrl(url: string): string {
  if (url.includes("/schools") || url.includes("/school")) {
    return "schools";
  }

  if (url.includes("/staff")) {
    if (url.includes("/nycps")) {
      return "nycps-staff";
    }
    if (url.includes("/teaching-lab") || url.includes("/teachingLab")) {
      return "teaching-lab-staff";
    }
    return "staff";
  }

  if (url.includes("/look-fors") || url.includes("/lookFors")) {
    return "look-fors";
  }

  if (url.includes("/rubrics")) {
    return "rubrics";
  }

  if (url.includes("/next-steps") || url.includes("/nextSteps")) {
    return "next-steps";
  }

  if (url.includes("/visits")) {
    return "visits";
  }

  if (url.includes("/coaching-logs") || url.includes("/coachingLogs")) {
    return "coaching-logs";
  }

  // Use a generic reference type as fallback
  return "references";
}

/**
 * Hook for fetching reference data for select components - simplified with direct operations
 */
export function useReferenceData<T extends BaseDocument = BaseDocument>({
  url,
  search = "",
  enabled = true,
  schema,
  entityType,
  selector: customSelector,
  fetcher = defaultFetcher,
  queryOptions = {},
}: UseReferenceDataOptions<T>) {
  // Determine the entity type from URL if not provided (for debugging/logging)
  const _derivedEntityType = useMemo(
    () => entityType || getEntityTypeFromUrl(url),
    [entityType, url],
  );

  // Build the URL with search parameter if provided
  const fetchUrl = useMemo(() => {
    if (!search) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}search=${encodeURIComponent(search)}`;
  }, [url, search]);

  // Use the custom selector or default selector
  const selector = useMemo(
    () =>
      customSelector || ((data: unknown) => defaultSelector<T>(data, schema)),
    [customSelector, schema],
  );

  const query = useQuery({
    queryKey: queryKeys.references.options(fetchUrl, search),
    queryFn: () => fetcher(fetchUrl),
    enabled,
    select: selector,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    ...queryOptions,
  });

  return {
    options: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

async function defaultFetcher(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    handleClientError(error, "useReferenceData.defaultFetcher");
    throw error;
  }
}

export function getEntityTypeFromUrlUtil(url: string): string {
  return getEntityTypeFromUrl(url);
}
