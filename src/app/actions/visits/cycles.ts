'use server';

import { connectToDB } from "@/lib/core/db";
import { CycleModel } from "@/models/core/cycle.model";
import { CycleInputZodSchema } from "@/lib/data/schemas/core/cycle";
import { createItem } from "@/lib/utils/general/server/crud";
import type { CycleInput } from "@/lib/data/schemas/core/cycle";

/**
 * Creates a new cycle
 * @param data The cycle data to create
 * @returns The created cycle
 */
export async function createCycle(data: CycleInput) {
  await connectToDB();
  return createItem(CycleModel, CycleInputZodSchema, data);
} 