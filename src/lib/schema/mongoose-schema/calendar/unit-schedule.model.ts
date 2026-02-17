import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

/**
 * Unit section schema (embedded document)
 * Can have subsection for split sections (Part 1, Part 2, etc.)
 */
const unitSectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true }, // e.g., "A", "B", "Ramp Up"
    subsection: { type: Number, required: false }, // Part number (1, 2, 3) for split sections
    name: { type: String, required: true }, // e.g., "Section A", "Section A (Part 1)"
    startDate: { type: String, required: false }, // YYYY-MM-DD
    endDate: { type: String, required: false }, // YYYY-MM-DD
    plannedDays: { type: Number, required: false },
    actualDays: { type: Number, required: false },
    notes: { type: String, required: false },
    color: { type: String, required: false },
  },
  { _id: false },
);

/**
 * Unit schedule schema
 */
const unitScheduleFields = {
  schoolYear: { type: String, required: true, index: true }, // e.g., "2024-2025"
  grade: { type: String, required: true, index: true }, // Content grade level (e.g., "8")
  subject: { type: String, required: false },
  unitNumber: { type: Number, required: true },
  unitName: { type: String, required: true },
  startDate: { type: String, required: false }, // YYYY-MM-DD
  endDate: { type: String, required: false }, // YYYY-MM-DD
  sections: { type: [unitSectionSchema], default: [] },
  color: { type: String, required: false },
  notes: { type: String, required: false },
  // Per-section config fields (when schedules are tied to a specific class section)
  school: { type: String, required: false, index: true }, // e.g., "IS313", "PS19"
  classSection: { type: String, required: false, index: true }, // e.g., "601", "701", "802"
  scopeSequenceTag: { type: String, required: false, index: true }, // e.g., "Grade 8", "Algebra 1" - identifies the curriculum
  ...standardDocumentFields,
};

const UnitScheduleSchema = new mongoose.Schema(unitScheduleFields, {
  ...standardSchemaOptions,
  collection: "unit-schedules",
});

// Index for efficient lookups (grade-level schedules without classSection)
UnitScheduleSchema.index({ schoolYear: 1, grade: 1, unitNumber: 1 });
// Index for per-section schedules by scopeSequenceTag (curriculum identifier)
UnitScheduleSchema.index({
  schoolYear: 1,
  scopeSequenceTag: 1,
  school: 1,
  classSection: 1,
  unitNumber: 1,
});

export const UnitScheduleModel =
  mongoose.models.UnitSchedule ||
  mongoose.model("UnitSchedule", UnitScheduleSchema);
