import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { CoachingCycleNumberZod, VisitNumberZod } from "@enums";

// ===== CAP IMPLEMENTATION RECORD FIELDS SCHEMA =====
export const CapImplementationRecordFieldsSchema = z.object({
  capId: z.string().describe("Reference to main CAP"),
  date: z.string().describe("Date when implementation occurred (ISO string)"),
  visitId: z.string().optional().describe("Reference to actual Visit entity"),
  cycleNumber: CoachingCycleNumberZod.describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.describe("Which visit within the cycle"),
  lookForImplemented: z.string().describe("What was actually observed/looked for"),
  glows: z.array(z.string()).describe("Areas of strength observed"),
  grows: z.array(z.string()).describe("Areas for improvement identified"),
  successMetrics: z.array(z.string()).describe("Metrics that showed success"),
  nextSteps: z.array(z.string()).describe("Defined next steps from this visit"),
  teacherReflection: z.string().optional().describe("Teacher's reflection on the session"),
  coachNotes: z.string().optional().describe("Additional coach observations"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

export const CapImplementationRecordZodSchema = BaseDocumentSchema.merge(CapImplementationRecordFieldsSchema);
export const CapImplementationRecordInputZodSchema = toInputSchema(CapImplementationRecordZodSchema);

export type CapImplementationRecord = z.infer<typeof CapImplementationRecordZodSchema>;
export type CapImplementationRecordInput = z.infer<typeof CapImplementationRecordInputZodSchema>;
