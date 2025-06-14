import mongoose from "mongoose";
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  capId: { type: String, required: true }, // Reference to main CAP
  type: { type: String, required: true },
  description: { type: String, required: true },
  achieved: { type: Boolean, required: false },
  sortOrder: { type: Number, default: 0 },
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps and standard transform
const CapOutcomeSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapOutcomeSchema.index({ capId: 1, sortOrder: 1 });
CapOutcomeSchema.index({ type: 1 });
CapOutcomeSchema.index({ achieved: 1 });
CapOutcomeSchema.index({ owners: 1 });

// Create model, checking for existing models
export const CapOutcomeModel = mongoose.models.CapOutcome || 
  mongoose.model("CapOutcome", CapOutcomeSchema);
