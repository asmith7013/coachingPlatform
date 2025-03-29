import { z } from "zod";

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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ✅ Auto-generate TypeScript types
export type NoteInput = z.infer<typeof NoteInputZodSchema>;
export type Note = z.infer<typeof NoteZodSchema>;