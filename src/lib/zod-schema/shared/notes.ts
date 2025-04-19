import { z } from "zod";
import { zDateField } from '@/lib/zod-schema/shared/dateHelpers';

// ✅ Note Input Schema
export const NoteInputZodSchema = z.object({
  date: z.string(), // Required date as ISO string
  type: z.string(), // Required type/category of the note
  heading: z.string(), // Required heading/title
  subheading: z.array(z.string()), // Array of subheading strings
});

// ✅ Note Full Schema
export const NoteZodSchema = NoteInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type NoteInput = z.infer<typeof NoteInputZodSchema>;
export type Note = z.infer<typeof NoteZodSchema>;