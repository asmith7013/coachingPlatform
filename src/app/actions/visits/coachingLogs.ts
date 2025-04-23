'use server';

import { connectToDB } from "@/lib/data-server/db/connection";
import { CoachingLogModel } from "@/lib/data-schema/mongoose-schema/visits/coaching-log.model";
import { CoachingLogZodSchema } from "@zod-schema/visits/coaching-log";
import { createItem } from "@data-server/crud/crud-operations";
import type { CoachingLog } from "@zod-schema/visits/coaching-log";

/**
 * Creates a new coaching log
 * @param data The coaching log data to create
 * @returns The created coaching log
 */
export async function createCoachingLog(data: CoachingLog) {
  await connectToDB();
  return createItem(CoachingLogModel, CoachingLogZodSchema, data);
} 