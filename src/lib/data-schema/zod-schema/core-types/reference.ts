import { z } from "zod";

// src/lib/data-schema/zod-schema/core-types/reference.ts
export const BaseReferenceZodSchema = z.object({
    _id: z.string(),
    label: z.string(),
    value: z.string().optional(),
});
  
export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;
  