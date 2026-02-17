import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const SkillRatingSchema = new mongoose.Schema(
  {
    skillId: { type: String, required: true },
    rating: {
      type: String,
      enum: ["not_observed", "partial", "mostly", "fully"],
      required: true,
    },
    evidence: { type: String, default: null },
  },
  { _id: false },
);

const DomainRatingSchema = new mongoose.Schema(
  {
    domainId: { type: String, required: true },
    overallRating: {
      type: String,
      enum: ["not_observed", "partial", "mostly", "fully"],
      default: null,
    },
    evidence: { type: String, default: null },
  },
  { _id: false },
);

const ObservationSchema = new mongoose.Schema(
  {
    teacherStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    observerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["classroom_visit", "debrief", "one_on_one", "quick_update"],
      default: null,
    },
    notes: { type: String, default: null },
    duration: { type: Number, default: null },
    ratings: [SkillRatingSchema],
    domainRatings: [DomainRatingSchema],
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_observations",
  },
);

ObservationSchema.index({ teacherStaffId: 1, date: -1 });
ObservationSchema.index({ observerId: 1 });

export const SkillsHubObservation =
  mongoose.models.SkillsHubObservation ||
  mongoose.model("SkillsHubObservation", ObservationSchema);
