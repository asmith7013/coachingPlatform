// src/lib/data-utilities/pagination/paginated-query.ts
import { z } from "zod";
import type { HydratedDocument, Model } from "mongoose";
import { connectToDB } from "@data-server/db/connection";
import { sanitizeFilters } from "@data-utilities/transformers/sanitize";
import { executePaginatedQuery } from "@data-utilities/pagination/pagination";
import { BaseDocument } from "@core-types/document";
import { 
  PaginatedResponse
} from "@core-types/pagination";
import { 
  QueryParams, 
  buildQueryParams
} from "@core-types/pagination";

/**
 * DRY, type-safe helper for paginated resource fetching
 */
export async function fetchPaginatedResource<
  TDoc extends Document,
  TSchema extends z.ZodTypeAny
>(
  model: Model<TDoc>,
  schema: TSchema,
  params: QueryParams = {}
): Promise<PaginatedResponse<z.infer<TSchema>>> {
  await connectToDB();
  const { page, limit, filters, sortBy, sortOrder } = buildQueryParams(params);
  const sanitized = sanitizeFilters(filters ?? {});
  
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