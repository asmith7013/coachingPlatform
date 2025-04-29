// src/lib/data-schema/zod-schema/integrations/monday.ts
import { z } from "zod";
import { zDateField } from '@/lib/data-schema/zod-schema/shared/dateHelpers';

// Define the Monday.com specific item data structure
export const MondayItemZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  boardId: z.string(),
  columnValues: z.record(z.string(), z.any()).optional(),
  lastSyncedAt: zDateField.optional(),
});

export type MondayItem = z.infer<typeof MondayItemZodSchema>;