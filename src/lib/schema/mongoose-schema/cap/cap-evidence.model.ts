import mongoose from "mongoose";
import { standardDocumentFields, standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  coachingActionPlanId: { type: String, required: false }, // Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE
  visitId: { type: String, required: false }, // Reference to Visit document _id if evidence was collected during visit
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: false },
  url: { type: String, required: false },
  uploadedFile: { type: String, required: false },
  dateCollected: { type: String, required: true }, // ISO date string
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CapEvidenceSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapEvidenceSchema.index({ coachingActionPlanId: 1 });
CapEvidenceSchema.index({ visitId: 1 });
CapEvidenceSchema.index({ type: 1 });
CapEvidenceSchema.index({ dateCollected: 1 });
CapEvidenceSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CapEvidenceModel = mongoose.models.CapEvidence || 
  mongoose.model("CapEvidence", CapEvidenceSchema);
