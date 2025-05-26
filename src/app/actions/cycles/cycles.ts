'use server';

import { connectToDB } from "@server/db/connection";
import { CycleModel } from "@mongoose-schema/core/cycle.model";
import { fetchPaginatedResource } from "@transformers/pagination/unified-pagination";
import { handleServerError } from "@error/handlers/server";
import type { QueryParams } from "@core-types/query";
import { Cycle, CycleZodSchema } from "@zod-schema/core/cycle";
import { ZodType } from "zod";
/**
 * Fetches a paginated list of cycles
 */
export async function fetchCycles(params: QueryParams) {
  try {
    await connectToDB();
    
    // Extract the params we need and pass the rest through
    const { sortBy = "cycleNum", sortOrder = "asc", ...otherParams } = params;
    
    return await fetchPaginatedResource(
      CycleModel,
      CycleZodSchema as ZodType<Cycle>,
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