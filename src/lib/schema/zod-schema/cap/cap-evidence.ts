// src/lib/schema/zod-schema/cap/cap-evidence.ts
import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { EvidenceTypeZod } from "@enums";

// ===== CAP EVIDENCE FIELDS SCHEMA =====
// Keep all existing business properties exactly as they were
export const CapEvidenceFieldsSchema = z.object({
  type: EvidenceTypeZod.default(EvidenceTypeZod.options[0]).describe("Type of evidence"),
  title: z.string().default('').describe("Title or brief description of evidence"),
  description: z.string().default('').describe("Detailed description of the evidence"),
  content: z.string().optional().default('').describe("Written summary or content"),
  url: z.string().optional().default('').describe("Link to external evidence"),
  uploadedFile: z.string().optional().default('').describe("Path to uploaded file"),
  dateCollected: z.string().default('').describe("When this evidence was collected (ISO string)")
});

// ===== FULL SCHEMA USING BASE PATTERN =====
export const CapEvidenceZodSchema = BaseDocumentSchema.merge(CapEvidenceFieldsSchema);

// ===== INPUT SCHEMA USING UTILITY =====
export const CapEvidenceInputZodSchema = toInputSchema(CapEvidenceZodSchema);

// ===== TYPE EXPORTS =====
export type CapEvidence = z.infer<typeof CapEvidenceZodSchema>;
export type CapEvidenceInput = z.infer<typeof CapEvidenceInputZodSchema>;