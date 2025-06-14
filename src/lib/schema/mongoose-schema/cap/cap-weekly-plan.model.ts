import mongoose from "mongoose";
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  capId: { type: String, required: true }, // Reference to main CAP
  date: { type: String, required: true }, // ISO date string
  cycleNumber: { type: Number, required: true },
  visitNumber: { type: Number, required: true },
  focus: { type: String, required: true },
  lookFor: { type: String, required: true },
  coachAction: { type: String, required: true },
  teacherAction: { type: String, required: true },
  progressMonitoring: { type: String, required: true },
  visitId: { type: String, required: false }, // Reference to actual Visit entity
  status: { type: String, default: 'planned' },
  sortOrder: { type: Number, default: 0 },
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps and standard transform
const CapWeeklyPlanSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapWeeklyPlanSchema.index({ capId: 1, sortOrder: 1 });
CapWeeklyPlanSchema.index({ capId: 1, cycleNumber: 1, visitNumber: 1 });
CapWeeklyPlanSchema.index({ date: 1 });
CapWeeklyPlanSchema.index({ status: 1 });
CapWeeklyPlanSchema.index({ visitId: 1 });
CapWeeklyPlanSchema.index({ owners: 1 });

// Create model, checking for existing models
export const CapWeeklyPlanModel = mongoose.models.CapWeeklyPlan || 
  mongoose.model("CapWeeklyPlan", CapWeeklyPlanSchema);
