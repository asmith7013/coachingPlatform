import { z } from "zod";

// Define standard response schema
export const StandardResponseSchema = z.object({
    items: z.array(z.record(z.unknown())).default([]),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    message: z.string().optional(),
    success: z.boolean().default(true),
  });