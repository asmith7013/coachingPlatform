'use server';

import { connectToDB } from "@/lib/db";
import { CycleModel } from "@/models/core/cycle.model";
import { fetchPaginatedResource } from "@/lib/server-utils/fetchPaginatedResource";
import { handleServerError } from "@/lib/error/handleServerError";
import type { FetchParams } from "@/lib/server-utils/fetchPaginatedResource";

/**
 * Fetches a paginated list of cycles
 */
export async function fetchCycles(params: FetchParams = {}) {
  try {
    await connectToDB();
    
    // Extract the params we need and pass the rest through
    const { sortBy = "cycleNum", sortOrder = "asc", ...otherParams } = params;
    
    return await fetchPaginatedResource(CycleModel, {
      ...otherParams,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    throw handleServerError(error);
  }
} 