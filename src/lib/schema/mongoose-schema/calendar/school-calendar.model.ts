import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from "@mongoose-schema/shared-options";

/**
 * Calendar event schema (embedded document)
 * Events without school/classSection are global (apply to everyone)
 * Events with school/classSection are section-specific
 */
const calendarEventSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  description: { type: String, required: false },
  // Optional section targeting (if absent = global event)
  school: { type: String, required: false },
  classSection: { type: String, required: false },
  // Whether math class happens on this day
  // false = no math class (testing, assembly, no school) - schedule shifts, light gray
  // true = math class happens (pop quiz, special lesson) - no shift, dark gray
  hasMathClass: { type: Boolean, default: false },
}, { _id: false });

/**
 * School calendar schema
 */
const schoolCalendarFields = {
  schoolYear: { type: String, required: true, index: true }, // e.g., "2024-2025"
  schoolId: { type: String, required: false, index: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  events: { type: [calendarEventSchema], default: [] },
  notes: { type: String, required: false },
  ...standardDocumentFields
};

const SchoolCalendarSchema = new mongoose.Schema(schoolCalendarFields, {
  ...standardSchemaOptions,
  collection: "school-calendars"
});

// Index for efficient lookups
SchoolCalendarSchema.index({ schoolYear: 1, schoolId: 1 });

export const SchoolCalendarModel = mongoose.models.SchoolCalendar ||
  mongoose.model("SchoolCalendar", SchoolCalendarSchema);
