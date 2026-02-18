import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { SchoolsZod, ScopeSequenceTagZod } from "@schema/enum/scm";

// =====================================
// PODSIE SCM GROUP SCHEMA
// =====================================

const PodsieScmGroupFieldsSchema = z.object({
  podsieGroupId: z.number().int().describe("Unique identifier from Podsie"),
  groupName: z
    .string()
    .nullable()
    .optional()
    .describe("Display name (synced from Podsie)"),
  gradeLevel: ScopeSequenceTagZod.nullable()
    .optional()
    .describe("Grade level for this section"),
  school: SchoolsZod.nullable().optional().describe("School identifier"),
});

export const PodsieScmGroupZodSchema = BaseDocumentSchema.merge(
  PodsieScmGroupFieldsSchema,
);
export const PodsieScmGroupInputZodSchema = toInputSchema(
  PodsieScmGroupZodSchema,
);

export type PodsieScmGroup = z.infer<typeof PodsieScmGroupZodSchema>;
export type PodsieScmGroupInput = z.infer<typeof PodsieScmGroupInputZodSchema>;
