import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { CoachingCycleNumberZod, VisitNumberZod } from "@enums";

// ===== CAP IMPLEMENTATION RECORD FIELDS SCHEMA =====
export const CapImplementationRecordFieldsSchema = z.object({
  date: z.string().default('').describe("Date when implementation occurred (ISO string)"),
  visitId: z.string().optional().default('').describe("Reference to actual Visit entity"),
  cycleNumber: CoachingCycleNumberZod.default(CoachingCycleNumberZod.options[0]).describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.default(VisitNumberZod.options[0]).describe("Which visit within the cycle"),
  lookForImplemented: z.string().default('').describe("What was actually observed/looked for"),
  glows: z.array(z.string()).default([]).describe("Areas of strength observed"),
  grows: z.array(z.string()).default([]).describe("Areas for improvement identified"),
  successMetrics: z.array(z.string()).default([]).describe("Metrics that showed success"),
  nextSteps: z.array(z.string()).default([]).describe("Defined next steps from this visit"),
  teacherReflection: z.string().optional().default('').describe("Teacher's reflection on the session"),
  coachNotes: z.string().optional().default('').describe("Additional coach observations")
});

export const CapImplementationRecordZodSchema = BaseDocumentSchema.merge(CapImplementationRecordFieldsSchema);
export const CapImplementationRecordInputZodSchema = toInputSchema(CapImplementationRecordZodSchema);

export type CapImplementationRecord = z.infer<typeof CapImplementationRecordZodSchema>;
export type CapImplementationRecordInput = z.infer<typeof CapImplementationRecordInputZodSchema>;

// Add helper for schema-driven defaults
export function createCapImplementationRecordDefaults(overrides: Partial<CapImplementationRecordInput> = {}): CapImplementationRecordInput {
  return {
    ...CapImplementationRecordInputZodSchema.parse({}),
    ...overrides
  };
}
