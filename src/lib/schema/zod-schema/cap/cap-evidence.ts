// src/lib/schema/zod-schema/cap/cap-evidence.ts
import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { EvidenceTypeZod } from "@enums";

// ===== CAP EVIDENCE FIELDS SCHEMA =====
// This schema is designed to be embedded in CAP documents
export const CapEvidenceFieldsSchema = z.object({
  // Remove coachingActionPlanId since this will be embedded in the CAP document
  visitId: z
    .string()
    .optional()
    .default("")
    .describe(
      "Reference to Visit document _id if evidence was collected during visit",
    ),
  type: EvidenceTypeZod.default(EvidenceTypeZod.options[0]).describe(
    "Type of evidence",
  ),
  title: z.string().describe("Title or brief description of evidence"),
  description: z.string().describe("Detailed description of the evidence"),
  content: z
    .string()
    .optional()
    .default("")
    .describe("Written summary or content"),
  url: z.string().optional().default("").describe("Link to external evidence"),
  uploadedFile: z
    .string()
    .optional()
    .default("")
    .describe("Path to uploaded file"),
  dateCollected: z
    .string()
    .describe("When this evidence was collected (ISO string)"),
});

// ===== FULL SCHEMA USING BASE PATTERN =====
// Keep standalone document schemas for backward compatibility and potential future use
export const CapEvidenceZodSchema = BaseDocumentSchema.merge(
  CapEvidenceFieldsSchema.extend({
    coachingActionPlanId: z
      .string()
      .optional()
      .describe(
        "Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE",
      ),
  }),
);

// ===== INPUT SCHEMA USING UTILITY =====
export const CapEvidenceInputZodSchema = toInputSchema(CapEvidenceZodSchema);

// ===== TYPE EXPORTS =====
export type CapEvidence = z.infer<typeof CapEvidenceZodSchema>;
export type CapEvidenceInput = z.infer<typeof CapEvidenceInputZodSchema>;

// Keep type exports for the fields only (used in embedded contexts)
export type CapEvidenceFields = z.infer<typeof CapEvidenceFieldsSchema>;
