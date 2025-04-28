'use server';

import { connectToDB } from "@data-server/db/connection";
import { CycleModel } from "@mongoose-schema/core/cycle.model";
import { fetchPaginatedResource } from "@data-utilities/pagination/paginated-query";
import { handleServerError } from "@error/handle-server-error";
import type { FetchParams } from "@core-types/api";
import { CycleZodSchema } from "@zod-schema/core/cycle";

/**
 * Fetches a paginated list of cycles
 */
export async function fetchCycles(params: FetchParams = {}) {
  try {
    await connectToDB();
    
    // Extract the params we need and pass the rest through
    const { sortBy = "cycleNum", sortOrder = "asc", ...otherParams } = params;
    
    return await fetchPaginatedResource(
      CycleModel,
      CycleZodSchema,
      {
        ...otherParams,
        sortBy,
        sortOrder,
      }
    );
  } catch (error) {
    throw handleServerError(error);
  }
} 