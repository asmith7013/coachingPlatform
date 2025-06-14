// src/lib/schema/zod-schema/cap/cap-evidence.ts
import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { EvidenceTypeZod } from "@enums";

// ===== CAP EVIDENCE FIELDS SCHEMA =====
// Keep all existing business properties exactly as they were
export const CapEvidenceFieldsSchema = z.object({
  capId: z.string().describe("Reference to main CAP"),
  outcomeId: z.string().optional().describe("Reference to specific outcome"),
  type: EvidenceTypeZod.describe("Type of evidence"),
  title: z.string().describe("Title or brief description of evidence"),
  description: z.string().describe("Detailed description of the evidence"),
  content: z.string().optional().describe("Written summary or content"),
  url: z.string().optional().describe("Link to external evidence"),
  uploadedFile: z.string().optional().describe("Path to uploaded file"),
  dateCollected: z.string().describe("When this evidence was collected (ISO string)"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

// ===== FULL SCHEMA USING BASE PATTERN =====
export const CapEvidenceZodSchema = BaseDocumentSchema.merge(CapEvidenceFieldsSchema);

// ===== INPUT SCHEMA USING UTILITY =====
export const CapEvidenceInputZodSchema = toInputSchema(CapEvidenceZodSchema);

// ===== TYPE EXPORTS =====
export type CapEvidence = z.infer<typeof CapEvidenceZodSchema>;
export type CapEvidenceInput = z.infer<typeof CapEvidenceInputZodSchema>;