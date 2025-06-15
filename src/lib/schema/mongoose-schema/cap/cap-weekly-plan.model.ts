import mongoose from "mongoose";
import { standardDocumentFields, standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  date: { type: String, required: true }, // ISO date string
  cycleNumber: { type: String, required: true }, // String to match Zod enum
  visitNumber: { type: String, required: true }, // String to match Zod enum
  focus: { type: String, required: true },
  lookFor: { type: String, required: true },
  coachAction: { type: String, required: true },
  teacherAction: { type: String, required: true },
  progressMonitoring: { type: String, required: true },
  visitId: { type: String, required: false }, // Reference to actual Visit entity
  status: { type: String, default: 'planned' },
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CapWeeklyPlanSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapWeeklyPlanSchema.index({ date: 1 });
CapWeeklyPlanSchema.index({ visitId: 1 });
CapWeeklyPlanSchema.index({ cycleNumber: 1 });
CapWeeklyPlanSchema.index({ visitNumber: 1 });
CapWeeklyPlanSchema.index({ status: 1 });
CapWeeklyPlanSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CapWeeklyPlanModel = mongoose.models.CapWeeklyPlan || 
  mongoose.model("CapWeeklyPlan", CapWeeklyPlanSchema);
