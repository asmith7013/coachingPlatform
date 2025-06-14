import mongoose from "mongoose";
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  capId: { type: String, required: true }, // Reference to main CAP
  outcomeId: { type: String, required: false }, // Reference to specific outcome
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: false },
  url: { type: String, required: false },
  uploadedFile: { type: String, required: false },
  dateCollected: { type: String, required: true }, // ISO date string
  sortOrder: { type: Number, default: 0 },
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps and standard transform
const CapEvidenceSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapEvidenceSchema.index({ capId: 1, sortOrder: 1 });
CapEvidenceSchema.index({ outcomeId: 1 });
CapEvidenceSchema.index({ type: 1 });
CapEvidenceSchema.index({ dateCollected: 1 });
CapEvidenceSchema.index({ owners: 1 });

// Create model, checking for existing models
export const CapEvidenceModel = mongoose.models.CapEvidence || 
  mongoose.model("CapEvidence", CapEvidenceSchema);
