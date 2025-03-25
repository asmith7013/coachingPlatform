import { z } from "zod";

// ✅ Note Schema
export const NoteZodSchema = z.object({
  date: z.string(), // Required date as ISO string
  type: z.string(), // Required type/category of the note
  heading: z.string(), // Required heading/title
  subheading: z.array(z.string()), // Array of subheading strings
});

// ✅ Auto-generate TypeScript type
export type Note = z.infer<typeof NoteZodSchema>;