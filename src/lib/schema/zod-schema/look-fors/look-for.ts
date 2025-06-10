import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { 
  getLookForDescriptionSummary, 
  isStudentFacing 
} from "@schema/reference/look-fors/look-for-helpers";

// LookFor Fields Schema
export const LookForFieldsSchema = z.object({
  lookForIndex: z.number().describe("Unique identifier within coaching cycle (typically 1-5)"),
  schoolIds: z.array(z.string()).describe("Array of School document _ids where this look-for applies"),
  teacherIds: z.array(z.string()).describe("Array of Teacher document _ids assigned to this look-for"),
  topic: z.string(),
  description: z.string(),
  category: z.string().optional(),
  status: z.string().optional(),
  studentFacing: z.string().describe("Whether look-for involves direct student interaction or teacher behavior"),
  rubricIds: z.array(z.string()).optional().describe("Array of Rubric document _ids for assessment criteria"),
});

// LookFor Full Schema
export const LookForZodSchema = BaseDocumentSchema.merge(LookForFieldsSchema);

// LookFor Input Schema
export const LookForInputZodSchema = toInputSchema(LookForZodSchema);

// LookFor Reference Schema
export const LookForReferenceZodSchema = BaseReferenceZodSchema.merge(
  LookForFieldsSchema
    .pick({
      lookForIndex: true,
      topic: true,
      category: true,
      status: true,
    })
    .partial()
).extend({
  schoolCount: z.number().optional(),
  teacherCount: z.number().optional(),
  descriptionSummary: z.string().optional(),
  isStudentFacing: z.boolean().optional(),
});

// LookForItem Schema (shared schema)
export const LookForItemZodSchema = z.object({
  originalLookFor: z.string().describe("Reference to source LookFor document _id"),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  lookForIndex: z.number().describe("Position within coaching cycle sequence (1-5)"),
  teacherIDs: z.array(z.string()).describe("Array of Teacher document _ids assigned to this item"),
  chosenBy: z.array(z.string()).describe("Array of User/Coach _ids who selected this item"),
  active: z.boolean().describe("Whether this look-for item is currently in use"),
});

// LookForItem Reference Schema
export const LookForItemReferenceZodSchema = BaseReferenceZodSchema.merge(
  z.object({
    title: z.string().optional(),
    lookForIndex: z.number().optional(),
    tags: z.array(z.string()).optional(),
    active: z.boolean().optional(),
    teacherCount: z.number().optional(),
    descriptionSummary: z.string().optional(),
  })
);

// LookFor Reference Transformer
export const lookForToReference = createReferenceTransformer<LookFor, LookForReference>(
  (lookFor) => lookFor.topic,
  (lookFor) => ({
    lookForIndex: lookFor.lookForIndex,
    topic: lookFor.topic,
    category: lookFor.category,
    status: lookFor.status,
    schoolCount: lookFor.schoolIds?.length || 0,
    teacherCount: lookFor.teacherIds?.length || 0,
    descriptionSummary: getLookForDescriptionSummary(lookFor),
    isStudentFacing: isStudentFacing(lookFor),
  }),
  LookForReferenceZodSchema
);

// Array transformer
export const lookForsToReferences = createArrayTransformer<LookFor, LookForReference>(
  lookForToReference
);

// // LookForItem Reference Transformer
// export const lookForItemToReference = createReferenceTransformer<LookForItem, LookForItemReference>(
//   (item) => item.title,
//   (item) => ({
//     title: item.title,
//     lookForIndex: item.lookForIndex,
//     tags: item.tags,
//     active: item.active,
//     teacherCount: item.teacherIDs?.length || 0,
//     descriptionSummary: item.description?.slice(0, 100) + (item.description?.length > 100 ? '...' : ''),
//   }),
//   LookForItemReferenceZodSchema
// );

// Auto-generate TypeScript types
export type LookForInput = z.infer<typeof LookForInputZodSchema>;
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForReference = z.infer<typeof LookForReferenceZodSchema>;
export type LookForItem = z.infer<typeof LookForItemZodSchema>;
export type LookForItemReference = z.infer<typeof LookForItemReferenceZodSchema>;