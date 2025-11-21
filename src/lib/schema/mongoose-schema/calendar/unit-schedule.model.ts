import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from "@mongoose-schema/shared-options";

/**
 * Unit section schema (embedded document)
 */
const unitSectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  name: { type: String, required: true },
  startDate: { type: String, required: false }, // YYYY-MM-DD
  endDate: { type: String, required: false }, // YYYY-MM-DD
  plannedDays: { type: Number, required: false },
  actualDays: { type: Number, required: false },
  notes: { type: String, required: false },
  color: { type: String, required: false },
}, { _id: false });

/**
 * Unit schedule schema
 */
const unitScheduleFields = {
  schoolYear: { type: String, required: true, index: true }, // e.g., "2024-2025"
  grade: { type: String, required: true, index: true },
  subject: { type: String, required: false },
  unitNumber: { type: Number, required: true },
  unitName: { type: String, required: true },
  startDate: { type: String, required: false }, // YYYY-MM-DD
  endDate: { type: String, required: false }, // YYYY-MM-DD
  sections: { type: [unitSectionSchema], default: [] },
  color: { type: String, required: false },
  notes: { type: String, required: false },
  ...standardDocumentFields
};

const UnitScheduleSchema = new mongoose.Schema(unitScheduleFields, {
  ...standardSchemaOptions,
  collection: "unit-schedules"
});

// Index for efficient lookups
UnitScheduleSchema.index({ schoolYear: 1, grade: 1, unitNumber: 1 });

export const UnitScheduleModel = mongoose.models.UnitSchedule ||
  mongoose.model("UnitSchedule", UnitScheduleSchema);
