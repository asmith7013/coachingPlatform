import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  // Core identification
  title: { type: String, required: true },
  teachers: [{ type: String, required: true }], // Array of teacher IDs
  coaches: [{ type: String, required: true }], // Array of coach IDs
  school: { type: String, required: true }, // School ID
  academicYear: { type: String, required: true },

  // Flattened needs and focus (no nested objects)
  ipgCoreAction: { type: String, required: true },
  ipgSubCategory: { type: String, required: true },
  rationale: { type: String, required: true },
  pdfAttachment: { type: String, required: false },

  // Simple goal statement
  goalDescription: { type: String, required: true },

  // Status and metadata
  status: { type: String, default: 'draft' },
  startDate: { type: String, required: true }, // ISO date string
  endDate: { type: String, required: false },
  cycleLength: { type: Number, default: 3 },

  // Goal achievement tracking (flat)
  goalMet: { type: Boolean, required: false },
  impactOnLearning: { type: String, required: false },
  lessonsLearned: { type: String, required: false },
  recommendationsForNext: { type: String, required: false },

  // References to related entities
  relatedVisits: [{ type: String, required: false }],
  relatedCycles: [{ type: String, required: false }],

  // BaseDocument pattern
  // ownerIds: [{ type: String, default: [] }],
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CoachingActionPlanSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CoachingActionPlanSchema.index({ school: 1, academicYear: 1 });
CoachingActionPlanSchema.index({ status: 1 });
CoachingActionPlanSchema.index({ teachers: 1 });
CoachingActionPlanSchema.index({ coaches: 1 });
CoachingActionPlanSchema.index({ startDate: 1 });
CoachingActionPlanSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CoachingActionPlanModel = mongoose.models.CoachingActionPlan || 
  mongoose.model("CoachingActionPlan", CoachingActionPlanSchema);
