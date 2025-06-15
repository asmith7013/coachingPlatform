import mongoose from "mongoose";
import { standardDocumentFields, standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  type: { type: String, required: true },
  description: { type: String, required: true },
  metrics: [{ type: mongoose.Schema.Types.Mixed, required: true }], // Nested metrics array
  evidence: [{ type: mongoose.Schema.Types.Mixed, required: false }], // Nested evidence array
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CapOutcomeSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapOutcomeSchema.index({ type: 1 });
CapOutcomeSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CapOutcomeModel = mongoose.models.CapOutcome || 
  mongoose.model("CapOutcome", CapOutcomeSchema);
