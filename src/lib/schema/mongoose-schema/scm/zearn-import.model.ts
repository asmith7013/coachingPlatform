import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const schemaFields = {
  date: { type: String, required: true },
  section: { type: String, required: true },
  teacher: { type: String, required: true },
  studentID: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  lessonTitle: { type: String, required: true },
  lessonCompletionDate: { type: String, required: true },
  weekRange: { type: String, required: false },
  weeklyMinutes: { type: String, required: false },
  importedAt: { type: String, required: false },
  importedBy: { type: String, required: false },
  ...standardDocumentFields
};

const ZearnImportRecordSchema = new mongoose.Schema(schemaFields, {
  ...standardSchemaOptions,
  collection: 'zearn_import_records'
});

// Add indexes for performance
ZearnImportRecordSchema.index({ date: 1, section: 1, teacher: 1 });
ZearnImportRecordSchema.index({ studentID: 1, lessonTitle: 1 });

export const ZearnImportRecordModel = mongoose.models.ZearnImportRecord || 
  mongoose.model("ZearnImportRecord", ZearnImportRecordSchema); 