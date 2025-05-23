import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Note Fields Schema
export const NoteFieldsSchema = z.object({
  date: zDateField, // Required date with proper handling
  type: z.string(), // Required type/category of the note
  heading: z.string(), // Required heading/title
  subheading: z.array(z.string()), // Array of subheading strings
});

// Note Full Schema
export const NoteZodSchema = BaseDocumentSchema.merge(NoteFieldsSchema);

// Note Input Schema
export const NoteInputZodSchema = toInputSchema(NoteZodSchema);

// Auto-generate TypeScript types
export type NoteInput = z.infer<typeof NoteInputZodSchema>;
export type Note = z.infer<typeof NoteZodSchema>;