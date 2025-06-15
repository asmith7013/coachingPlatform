import mongoose from "mongoose";
import { standardDocumentFields, standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  collectionMethod: { type: String, required: true },
  baselineValue: { type: String, required: false },
  targetValue: { type: String, required: true },
  currentValue: { type: String, required: false },
  notes: { type: String, required: false },
  // ownerIds: [{ type: String, default: [] }],
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CapMetricSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapMetricSchema.index({ name: 1 });
CapMetricSchema.index({ type: 1 });
CapMetricSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CapMetricModel = mongoose.models.CapMetric || 
  mongoose.model("CapMetric", CapMetricSchema);
