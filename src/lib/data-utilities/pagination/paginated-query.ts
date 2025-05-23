// src/lib/data-utilities/pagination/paginated-query.ts
/**
 * @deprecated This file is deprecated. Use selector-based pagination from @/lib/query/utilities/pagination.ts instead.
 * 
 * Migration Guide:
 * 1. Replace fetchPaginatedResource with fetchPaginatedResourceWithSelector
 * 2. Use the selector system for consistent data transformation
 * 3. Consider using createPaginatedQueryHook for React Query integration
 */

import { z } from "zod";
import type { HydratedDocument, Model } from "mongoose";
import { connectToDB } from "@data-server/db/connection";
import { executePaginatedQuery } from "@data-utilities/pagination/pagination";
import { prepareForCreate } from "@data-utilities/transformers/core/db-transformers";
import { BaseDocument } from "@core-types/document";
import { 
  PaginatedResponse
} from "@core-types/pagination";
import { 
  QueryParams, 
  buildQueryParams,
  DEFAULT_QUERY_PARAMS
} from "@core-types/query";

/**
 * @deprecated Use fetchPaginatedResourceWithSelector from @/lib/query/utilities/pagination.ts instead.
 * DRY, type-safe helper for paginated resource fetching
 */
export async function fetchPaginatedResource<
  TDoc extends Document,
  TSchema extends z.ZodTypeAny
>(
  model: Model<TDoc>,
  schema: TSchema,
  params: QueryParams = DEFAULT_QUERY_PARAMS
): Promise<PaginatedResponse<z.infer<TSchema>>> {
  await connectToDB();
  const { page, limit, filters, sortBy, sortOrder } = buildQueryParams(params);
  const sanitized = prepareForCreate(filters ?? {});
  
  // Use executePaginatedQuery which now returns PaginatedResponse with success: true
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