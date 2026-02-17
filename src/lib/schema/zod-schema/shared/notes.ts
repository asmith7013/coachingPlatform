import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import {
  createReferenceTransformer,
  createArrayTransformer,
} from "@data-processing/transformers/factories/reference-factory";
import { formatSubheadings } from "@schema/reference/shared/notes-helpers";
import { formatMediumDate } from "@data-processing/transformers/utils/date-utils";

// Note Fields Schema
export const NoteFieldsSchema = z.object({
  coachingActionPlanId: z
    .string()
    .optional()
    .describe(
      "Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE",
    ),
  visitId: z
    .string()
    .optional()
    .describe("Reference to Visit document _id if note is visit-specific"),
  date: z.string().describe("Date of note (ISO string)"),
  type: z.string().describe("Type of note"),
  heading: z.string().describe("Heading for the note"),
  subheading: z.array(z.string()).describe("Subheadings for the note"),
});

// Note Full Schema
export const NoteZodSchema = BaseDocumentSchema.merge(NoteFieldsSchema);

// Note Input Schema
export const NoteInputZodSchema = toInputSchema(NoteZodSchema);

// Note Reference Schema
export const NoteReferenceZodSchema = BaseReferenceZodSchema.merge(
  NoteFieldsSchema.pick({
    coachingActionPlanId: true,
    visitId: true,
    date: true,
    type: true,
    heading: true,
    subheading: true,
  }).partial(),
);

// Note Reference Transformer
export const noteToReference = createReferenceTransformer<Note, NoteReference>(
  (note) => note.heading || "Untitled",
  (note) => ({
    coachingActionPlanId: note.coachingActionPlanId,
    visitId: note.visitId,
    date: note.date,
    type: note.type,
    dateFormatted: formatMediumDate(new Date(note.date)),
    subheadingCount: note.subheading?.length || 0,
    subheadingSummary: formatSubheadings(note, 100),
  }),
  NoteReferenceZodSchema,
);

// Array transformer
export const notesToReferences = createArrayTransformer<Note, NoteReference>(
  noteToReference,
);

// Auto-generate TypeScript types
export type NoteInput = z.infer<typeof NoteInputZodSchema>;
export type Note = z.infer<typeof NoteZodSchema>;
export type NoteReference = z.infer<typeof NoteReferenceZodSchema>;
