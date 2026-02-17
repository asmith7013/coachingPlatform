import mongoose from "mongoose";
import {
  standardDocumentFields,
  standardSchemaOptions,
} from "@mongoose-schema/shared-options";

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  date: { type: String, required: true }, // ISO date string
  visitId: { type: String, required: false }, // Reference to actual Visit entity
  cycleNumber: { type: String, required: true }, // String to match Zod enum
  visitNumber: { type: String, required: true }, // String to match Zod enum
  lookForImplemented: { type: String, required: true },
  glows: [{ type: String, required: true }], // Areas of strength
  grows: [{ type: String, required: true }], // Areas for improvement
  successMetrics: [{ type: String, required: true }], // Metrics showing success
  nextSteps: [{ type: String, required: true }], // Next steps from visit
  teacherReflection: { type: String, required: false },
  coachNotes: { type: String, required: false },
  ...standardDocumentFields,
};

// Create schema with timestamps and standard transform
const CapImplementationRecordSchema = new mongoose.Schema(
  schemaFields,
  standardSchemaOptions,
);

// Add indexes for performance
CapImplementationRecordSchema.index({ date: 1 });
CapImplementationRecordSchema.index({ visitId: 1 });
CapImplementationRecordSchema.index({ cycleNumber: 1 });
CapImplementationRecordSchema.index({ visitNumber: 1 });
CapImplementationRecordSchema.index({ ownerIds: 1 });

// Create model, checking for existing models
export const CapImplementationRecordModel =
  mongoose.models.CapImplementationRecord ||
  mongoose.model("CapImplementationRecord", CapImplementationRecordSchema);
