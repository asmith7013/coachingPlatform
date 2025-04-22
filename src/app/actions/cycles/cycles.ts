'use server';

import { connectToDB } from "@/lib/core/db";
import { CycleModel } from "@/models/core/cycle.model";
import { fetchPaginatedResource } from "@/lib/utils/general/server/fetchPaginatedResource";
import { handleServerError } from "@/lib/core/error/handleServerError";
import type { FetchParams } from "@/lib/utils/general/server/fetchPaginatedResource";
import { CycleZodSchema } from "@/lib/data/schemas/core/cycle";

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