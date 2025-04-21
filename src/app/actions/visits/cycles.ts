'use server';

import { connectToDB } from "@/lib/db";
import { CycleModel } from "@/models/core/cycle.model";
import { CycleInputZodSchema } from "@/lib/zod-schema/core/cycle";
import { createItem } from "@/lib/server-utils/crud";
import type { CycleInput } from "@/lib/zod-schema/core/cycle";

/**
 * Creates a new cycle
 * @param data The cycle data to create
 * @returns The created cycle
 */
export async function createCycle(data: CycleInput) {
  await connectToDB();
  return createItem(CycleModel, CycleInputZodSchema, data);
} 