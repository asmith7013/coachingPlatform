'use server';

import { connectToDB } from "@server/db/connection";
import { CycleModel } from "@mongoose-schema/core/cycle.model";
import { CycleInputZodSchema } from "@zod-schema/core/cycle";
import { createItem } from "@/lib/server/crud/crud-operations";
import type { CycleInput } from "@zod-schema/core/cycle";

/**
 * Creates a new cycle
 * @param data The cycle data to create
 * @returns The created cycle
 */
export async function createCycle(data: CycleInput) {
  await connectToDB();
  return createItem(CycleModel, CycleInputZodSchema, data);
} 