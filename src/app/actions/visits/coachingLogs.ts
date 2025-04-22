'use server';

import { connectToDB } from "@/lib/core/db";
import { CoachingLogModel } from "@/models/visits/coaching-log.model";
import { CoachingLogZodSchema } from "@/lib/data/schemas/visits/coaching-log";
import { createItem } from "@/lib/utils/general/server/crud";
import type { CoachingLog } from "@/lib/data/schemas/visits/coaching-log";

/**
 * Creates a new coaching log
 * @param data The coaching log data to create
 * @returns The created coaching log
 */
export async function createCoachingLog(data: CoachingLog) {
  await connectToDB();
  return createItem(CoachingLogModel, CoachingLogZodSchema, data);
} 