import { z } from "zod";

export const ObservationTypeEnum = z.enum([
  "classroom_visit",
  "debrief",
  "one_on_one",
  "quick_update",
]);
export type ObservationType = z.infer<typeof ObservationTypeEnum>;

export const RatingScaleEnum = z.enum([
  "not_observed",
  "partial",
  "mostly",
  "fully",
]);
export type RatingScale = z.infer<typeof RatingScaleEnum>;

export const ObservationRatingInputSchema = z.object({
  skillId: z.string(),
  rating: RatingScaleEnum,
  evidence: z.string().nullable().optional(),
});
export type ObservationRatingInput = z.infer<
  typeof ObservationRatingInputSchema
>;

export const DomainRatingInputSchema = z.object({
  domainId: z.string(),
  overallRating: RatingScaleEnum.nullable().optional(),
  evidence: z.string().nullable().optional(),
});
export type DomainRatingInput = z.infer<typeof DomainRatingInputSchema>;

export const ObservationInputSchema = z.object({
  teacherStaffId: z.string(),
  date: z.string(),
  type: ObservationTypeEnum.nullable().optional(),
  notes: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  ratings: z.array(ObservationRatingInputSchema),
  domainRatings: z.array(DomainRatingInputSchema).default([]),
});
export type ObservationInput = z.infer<typeof ObservationInputSchema>;

export const ObservationDocumentSchema = z.object({
  _id: z.string(),
  teacherStaffId: z.string(),
  observerId: z.string(),
  date: z.string(),
  type: ObservationTypeEnum.nullable(),
  notes: z.string().nullable(),
  duration: z.number().nullable(),
  ratings: z.array(
    z.object({
      skillId: z.string(),
      rating: RatingScaleEnum,
      evidence: z.string().nullable(),
    }),
  ),
  domainRatings: z.array(
    z.object({
      domainId: z.string(),
      overallRating: RatingScaleEnum.nullable(),
      evidence: z.string().nullable(),
    }),
  ),
  createdAt: z.string(),
});
export type ObservationDocument = z.infer<typeof ObservationDocumentSchema>;
