import mongoose from "mongoose";
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  capId: { type: String, required: true }, // Reference to main CAP
  outcomeId: { type: String, required: false }, // Reference to specific outcome
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  collectionMethod: { type: String, required: true },
  baselineValue: { type: String, required: false },
  targetValue: { type: String, required: true },
  currentValue: { type: String, required: false },
  finalValue: { type: String, required: false },
  goalMet: { type: Boolean, required: false },
  notes: { type: String, required: false },
  sortOrder: { type: Number, default: 0 },
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps and standard transform
const CapMetricSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapMetricSchema.index({ capId: 1, sortOrder: 1 });
CapMetricSchema.index({ outcomeId: 1 });
CapMetricSchema.index({ type: 1 });
CapMetricSchema.index({ owners: 1 });

// Create model, checking for existing models
export const CapMetricModel = mongoose.models.CapMetric || 
  mongoose.model("CapMetric", CapMetricSchema);
