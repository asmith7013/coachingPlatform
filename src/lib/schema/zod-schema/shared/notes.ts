import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { formatSubheadings } from "@schema/reference/shared/notes-helpers";
import { formatMediumDate } from "@schema/reference/shared/date-helpers";

// Note Fields Schema
export const NoteFieldsSchema = z.object({
  date: zDateField,
  type: z.string(),
  heading: z.string(),
  subheading: z.array(z.string()),
});

// Note Full Schema
export const NoteZodSchema = BaseDocumentSchema.merge(NoteFieldsSchema);

// Note Input Schema
export const NoteInputZodSchema = toInputSchema(NoteZodSchema);

// Note Reference Schema
export const NoteReferenceZodSchema = BaseReferenceZodSchema.extend({
  // Explicitly define fields
  type: z.string().optional(),
  date: z.date().optional(), // Define date directly, not picked from NoteFieldsSchema
  dateFormatted: z.string().optional(),
  subheadingCount: z.number().optional(),
  subheadingSummary: z.string().optional(),
});

// Note Reference Transformer
export const noteToReference = createReferenceTransformer<Note, NoteReference>(
  (note) => note.heading,
  (note) => ({
    date: note.date,
    type: note.type,
    dateFormatted: formatMediumDate(note.date),
    subheadingCount: note.subheading?.length || 0,
    subheadingSummary: formatSubheadings(note, 100),
  }),
  NoteReferenceZodSchema
);

// Array transformer
export const notesToReferences = createArrayTransformer<Note, NoteReference>(
  noteToReference
);

// Auto-generate TypeScript types
export type NoteInput = z.infer<typeof NoteInputZodSchema>;
export type Note = z.infer<typeof NoteZodSchema>;
export type NoteReference = z.infer<typeof NoteReferenceZodSchema>;