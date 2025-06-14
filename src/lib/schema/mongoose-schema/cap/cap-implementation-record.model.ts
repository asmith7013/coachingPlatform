import mongoose from "mongoose";
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  capId: { type: String, required: true }, // Reference to main CAP
  date: { type: String, required: true }, // ISO date string
  visitId: { type: String, required: false }, // Reference to actual Visit entity
  cycleNumber: { type: Number, required: true },
  visitNumber: { type: Number, required: true },
  lookForImplemented: { type: String, required: true },
  glows: [{ type: String, required: true }], // Areas of strength
  grows: [{ type: String, required: true }], // Areas for improvement
  successMetrics: [{ type: String, required: true }], // Metrics showing success
  nextSteps: [{ type: String, required: true }], // Next steps from visit
  teacherReflection: { type: String, required: false },
  coachNotes: { type: String, required: false },
  sortOrder: { type: Number, default: 0 },
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps and standard transform
const CapImplementationRecordSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CapImplementationRecordSchema.index({ capId: 1, sortOrder: 1 });
CapImplementationRecordSchema.index({ capId: 1, cycleNumber: 1, visitNumber: 1 });
CapImplementationRecordSchema.index({ date: 1 });
CapImplementationRecordSchema.index({ visitId: 1 });
CapImplementationRecordSchema.index({ owners: 1 });

// Create model, checking for existing models
export const CapImplementationRecordModel = mongoose.models.CapImplementationRecord || 
  mongoose.model("CapImplementationRecord", CapImplementationRecordSchema);
