'use server';

import { connectToDB } from "@/lib/db";
import { CoachingLogModel } from "@/models/visits/coaching-log.model";
import { CoachingLogZodSchema } from "@/lib/zod-schema/visits/coaching-log";
import { createItem } from "@/lib/server-utils/crud";
import type { CoachingLog } from "@/lib/zod-schema/visits/coaching-log";

/**
 * Creates a new coaching log
 * @param data The coaching log data to create
 * @returns The created coaching log
 */
export async function createCoachingLog(data: CoachingLog) {
  await connectToDB();
  return createItem(CoachingLogModel, CoachingLogZodSchema, data);
} 