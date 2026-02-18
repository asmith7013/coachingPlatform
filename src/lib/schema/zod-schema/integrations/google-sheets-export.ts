import { z } from "zod";

export const SyncResultZodSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  dailyEventsCreated: z.number().optional(),
  lessonCompletionsCreated: z.number().optional(),
  processed: z.number().optional(),
  successfulRows: z.number().optional(),
  failedRows: z.number().optional(),
  zearnCompletions: z.number().optional(),
  snorklCompletions: z.number().optional(),
});

export const ExportResultZodSchema = z.object({
  totalRowsExported: z.number(),
  processedSheets: z.array(
    z.object({
      name: z.string(),
      rowsExported: z.number(),
      duplicatesFound: z.boolean(),
      error: z.string().optional(),
    }),
  ),
  duplicatesFound: z.boolean(),
  duplicateDetails: z.array(
    z.object({
      existing: z.string(),
      new: z.string(),
      studentId: z.string(),
    }),
  ),
  syncResult: SyncResultZodSchema.optional(),
});

export const ExportConfigZodSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  userEmail: z.string().email("Valid email required"),
  dryRun: z.boolean().default(false),
  syncToMongoDB: z.boolean().default(false),
});

export type ExportResult = z.infer<typeof ExportResultZodSchema>;
export type ExportConfig = z.infer<typeof ExportConfigZodSchema>;
