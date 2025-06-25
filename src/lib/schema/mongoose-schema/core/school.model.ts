import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { GradeLevels } from '@enums';
// import { connectToDB } from "@data-server/db/connection";

const schoolFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  address: { type: String },
  emoji: { type: String },
  gradeLevelsSupported: [{ type: String, required: true, enum: Object.values(GradeLevels) }],
  staffList: [{ type: String, required: true }],
  schedules: [{ type: String, required: true }],
  cycles: [{ type: String, required: true }],
  yearsOfIMImplementation: { type: Number, required: true, min: 0 },
  ...standardDocumentFields
};

const SchoolSchema = new mongoose.Schema(schoolFields, {
  ...standardSchemaOptions,
  collection: 'schools'
});

export const SchoolModel = mongoose.models.School || 
  mongoose.model('School', SchoolSchema);

