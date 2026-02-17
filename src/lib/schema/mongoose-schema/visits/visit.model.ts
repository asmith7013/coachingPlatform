import mongoose from "mongoose";
import { AllowedPurposes, ModeDone, GradeLevels } from "@enums";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const SessionLinkSchema = new mongoose.Schema(
  {
    purpose: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    staffIds: [{ type: String, required: true }],
  },
  { _id: false },
);

const visitFields = {
  // Primary relationships - aligned with Zod
  coachingActionPlanId: { type: String, required: true },
  date: { type: String },
  schoolId: { type: String, required: true },
  coachId: { type: String, required: true },

  // Optional relationships
  // cycleId: { type: String },
  teacherId: { type: String },

  // Visit metadata
  allowedPurpose: { type: String, enum: Object.values(AllowedPurposes) },
  modeDone: { type: String, enum: Object.values(ModeDone) },
  gradeLevelsSupported: [
    { type: String, enum: Object.values(GradeLevels), default: [] },
  ],

  // Schedule reference (replaces embedded events)
  visitScheduleId: { type: String },

  // NEW: Reference to embedded weekly plan
  weeklyPlanIndex: { type: Number },

  // NEW: Metrics to focus on during this visit
  focusOutcomeIndexes: [{ type: Number }],

  // Supporting content
  sessionLinks: [SessionLinkSchema],

  // Monday.com integration
  mondayItemId: { type: String },
  mondayBoardId: { type: String },
  mondayItemName: { type: String },
  mondayLastSyncedAt: { type: String },

  // Import fields
  siteAddress: { type: String },
  endDate: { type: String },

  // Coaching Log Submission Fields
  coachingLogSubmitted: { type: Boolean, default: false },

  ...standardDocumentFields,
};

const VisitSchema = new mongoose.Schema(visitFields, {
  ...standardSchemaOptions,
  collection: "visits",
});

export const VisitModel =
  mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
