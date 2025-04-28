// src/lib/data-utilities/pagination/paginated-query.ts
import { z } from "zod";
import type { HydratedDocument, Model } from "mongoose";
import { connectToDB } from "@data-server/db/connection";
import { sanitizeFilters } from "@data-utilities/transformers/sanitize";
import { executePaginatedQuery } from "./pagination";
import { BaseDocument } from "@core-types/document";
import { 
  FetchParams, 
  DEFAULT_FETCH_PARAMS as DEFAULT_PARAMS,
  getDefaultFetchParams as getDefaultParams 
} from "@core-types/api";

/** Default pagination + filter params - re-export for compatibility */
export const DEFAULT_FETCH_PARAMS = DEFAULT_PARAMS;

/**
 * Get default fetch params with optional overrides - adapter for compatibility
 */
export function getDefaultFetchParams(
  params: Partial<FetchParams> = {}
): ReturnType<typeof getDefaultParams> {
  return getDefaultParams(params);
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
    model as unknown as Model<HydratedDocument<BaseDocument>>,
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