import { z } from "zod";
import type { Document, Model } from "mongoose";
import { connectToDB } from "@/lib/db";
import { sanitizeFilters } from "./sanitize";
import { executePaginatedQuery } from "./pagination";

export interface FetchParams {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Default pagination + filter params */
export const DEFAULT_FETCH_PARAMS: Required<FetchParams> = {
  page: 1,
  limit: 10,
  filters: {},
  sortBy: "createdAt",
  sortOrder: "desc",
};

/**
 * Get default fetch params with optional overrides
 */
export function getDefaultFetchParams({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}: Partial<FetchParams> = {}): Required<FetchParams> {
  // Prevent using sort directions as sortBy values
  const invalidSortByValues = ['asc', 'desc', 'ascending', 'descending'];
  const safeSortBy = invalidSortByValues.includes(sortBy?.toLowerCase() || '')
    ? 'createdAt' // Safe default if someone mistakenly uses a sort direction
    : sortBy;

  return {
    page: page ?? 1,
    limit: limit ?? 10,
    filters: filters ?? {},
    sortBy: safeSortBy ?? "createdAt",
    sortOrder: sortOrder ?? "desc",
  };
}

/**
 * DRY, type-safe helper for paginated resource fetching
 */
export async function fetchPaginatedResource<
  TDoc extends Document,
  TSchema extends z.ZodTypeAny
>(
  model: Model<TDoc>,
  schema: TSchema,
  params: FetchParams = {}
): Promise<{
  items: z.infer<TSchema>[];
  total: number;
  empty: boolean;
}> {
  await connectToDB();

  const { page, limit, filters, sortBy, sortOrder } = getDefaultFetchParams(params);
  const sanitized = sanitizeFilters(filters ?? {});

  return executePaginatedQuery(
    model,
    sanitized,
    schema,
    {
      page,
      limit,
      sortBy,
      sortOrder,
    }
  );
} 