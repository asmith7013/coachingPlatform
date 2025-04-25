'use server';

import { z } from "zod";
import { connectToDB } from "@/lib/data-server/db/connection";
import { VisitModel } from "@/lib/data-schema/mongoose-schema/visits/visit.model";
import { VisitInputZodSchema, VisitZodSchema } from "@/lib/data-schema/zod-schema/visits/visit";
import { handleServerError } from "@/lib/core/error/handle-server-error";
import { handleValidationError } from "@/lib/core/error/handle-validation-error";
import { createItem } from "@/lib/data-server/crud/crud-operations";
import { fetchPaginatedResource, type FetchParams } from "@/lib/data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@/lib/data-utilities/pagination/sort-utils";
import type { Visit } from "@/lib/data-schema/zod-schema/visits/visit";

// Valid sort fields for visits
const validSortFields = ['date', 'createdAt', 'updatedAt', 'school', 'coach'];

/** Fetch Visits */
export async function fetchVisits(params: FetchParams = {}) {
  try {
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'date');
    
    return fetchPaginatedResource(
      VisitModel,
      VisitZodSchema,
      {
        ...params,
        sortBy: safeSortBy,
        sortOrder: params.sortOrder ?? "desc"
      }
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create Visit */
export async function createVisit(data: Visit) {
  try {
    await connectToDB();
    return createItem(
      VisitModel, 
      VisitInputZodSchema, 
      data, 
      ["/dashboard/visits"]
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
} 