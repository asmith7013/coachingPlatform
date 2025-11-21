import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from "@mongoose-schema/shared-options";

/**
 * Calendar event schema (embedded document)
 */
const calendarEventSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["holiday", "school_closed", "half_day", "professional_development", "parent_conference", "testing", "other"],
    required: true
  },
  description: { type: String, required: false },
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
