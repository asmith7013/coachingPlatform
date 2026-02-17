import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { z } from "zod";

// Use the shared base document schema directly
export const BaseDocumentZodSchema = BaseDocumentSchema;

// Use the shared utility function
export const createDocumentInputSchema = toInputSchema;

// Type export for convenience
export type BaseDocument = z.infer<typeof BaseDocumentZodSchema>;
