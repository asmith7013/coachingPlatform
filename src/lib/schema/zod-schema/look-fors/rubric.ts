import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { formatRubricCategory, getRubricContentSummary } from "@schema/reference/look-fors/rubric-helpers";

// Rubric Fields Schema
export const RubricFieldsSchema = z.object({
  score: z.number().describe("Numeric score value (typically 1-4 scale)"),
  category: z.array(z.string()),
  content: z.array(z.string()).optional(),
  parentId: z.string().optional().describe("Reference to parent Rubric document _id for hierarchical structure"),
  collectionId: z.string().optional().describe("Reference to collection/group this rubric belongs to"),
  hex: z.string().optional().describe("Hexadecimal color code for visual representation"),
});

// Rubric Full Schema
export const RubricZodSchema = BaseDocumentSchema.merge(RubricFieldsSchema);

// Rubric Input Schema
export const RubricInputZodSchema = toInputSchema(RubricZodSchema);

// Rubric Reference Schema
export const RubricReferenceZodSchema = BaseReferenceZodSchema.merge(
  RubricFieldsSchema
    .pick({
      score: true,
      category: true,
      hex: true,
    })
    .partial()
).extend({
  contentSummary: z.string().optional(),
  categoryDisplay: z.string().optional(),
  hasChildren: z.boolean().optional(),
});

// Rubric Reference Transformer
export const rubricToReference = createReferenceTransformer<Rubric, RubricReference>(
  (rubric) => {
    const category = rubric.category?.length > 0 ? rubric.category[0] : '';
    return `${rubric.score} - ${category}`;
  },
  (rubric) => ({
    score: rubric.score,
    category: rubric.category,
    hex: rubric.hex,
    contentSummary: getRubricContentSummary(rubric),
    categoryDisplay: formatRubricCategory(rubric),
    hasChildren: !!rubric.parentId,
  }),
  RubricReferenceZodSchema
);

// Array transformer
export const rubricsToReferences = createArrayTransformer<Rubric, RubricReference>(
  rubricToReference
);

// RubricScore Fields Schema
export const RubricScoreFieldsSchema = z.object({
  date: zDateField,
  score: z.number().describe("Numeric rubric score achieved (typically 1-4 scale)"),
  staffId: z.string().describe("Reference to Staff document _id who received this score"),
  schoolId: z.string().describe("Reference to School document _id where scoring occurred"),
});

// RubricScore Full Schema
export const RubricScoreZodSchema = BaseDocumentSchema.merge(RubricScoreFieldsSchema);

// RubricScore Input Schema
export const RubricScoreInputZodSchema = toInputSchema(RubricScoreZodSchema);

// RubricScore Reference Schema
export const RubricScoreReferenceZodSchema = BaseReferenceZodSchema.merge(
  RubricScoreFieldsSchema
    .pick({
      date: true,
      score: true,
      staffId: true,
      schoolId: true,
    })
    .partial()
).extend({
  dateFormatted: z.string().optional(),
  staffName: z.string().optional(),
  schoolName: z.string().optional(),
});

// Auto-generate TypeScript types
export type Rubric = z.infer<typeof RubricZodSchema>;
export type RubricInput = z.infer<typeof RubricInputZodSchema>;
export type RubricReference = z.infer<typeof RubricReferenceZodSchema>;

export type RubricScore = z.infer<typeof RubricScoreZodSchema>;
export type RubricScoreInput = z.infer<typeof RubricScoreInputZodSchema>;
export type RubricScoreReference = z.infer<typeof RubricScoreReferenceZodSchema>;