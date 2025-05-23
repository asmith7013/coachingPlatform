'use server';

import { z } from "zod";
import { connectToDB } from "@data-server/db/connection";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { VisitInputZodSchema, VisitZodSchema } from "@zod-schema/visits/visit";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { createItem } from "@data-server/crud/crud-operations";
import { fetchPaginatedResource } from "@data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@data-utilities/pagination/sort-utils";
import type { Visit } from "@zod-schema/visits/visit";
import { QueryParams } from "@core-types/query";

// Valid sort fields for visits
const validSortFields = ['date', 'createdAt', 'updatedAt', 'school', 'coach'];

/** Fetch Visits */
export async function fetchVisits(params: QueryParams = {}) {
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