import mongoose from "mongoose";
import { BellScheduleTypes } from "@enums";
import {
  BellScheduleBlockSchema,
  TeacherScheduleBlockSchema,
  VisitScheduleBlockSchema,
} from "@mongoose-schema/schedules/schedule-events.model";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

// =====================================
// SHARED SCHEDULE FIELDS
// =====================================

const baseScheduleFields = {
  schoolId: { type: String, required: true },
  dayIndices: [{ type: Number, min: 0, max: 4, required: true }],
  ...standardDocumentFields,
};

// =====================================
// BELL SCHEDULE MODEL
// =====================================

const bellScheduleFields = {
  ...baseScheduleFields,
  scheduleType: { type: String, enum: ["bellSchedule"], required: true },
  name: { type: String, required: true },
  bellScheduleType: {
    type: String,
    enum: Object.values(BellScheduleTypes),
    required: true,
  },
  timeBlocks: [BellScheduleBlockSchema],
};

const BellScheduleSchema = new mongoose.Schema(bellScheduleFields, {
  ...standardSchemaOptions,
  collection: "bellschedules",
});

// =====================================
// TEACHER SCHEDULE MODEL
// =====================================

const teacherScheduleFields = {
  ...baseScheduleFields,
  scheduleType: { type: String, enum: ["teacherSchedule"], required: true },
  teacherId: { type: String, required: true },
  bellScheduleId: { type: String, required: true },
  timeBlocks: [TeacherScheduleBlockSchema],
};

const TeacherScheduleSchema = new mongoose.Schema(teacherScheduleFields, {
  ...standardSchemaOptions,
  collection: "teacherschedules",
});

// =====================================
// VISIT SCHEDULE MODEL
// =====================================

const visitScheduleFields = {
  ...baseScheduleFields,
  scheduleType: { type: String, enum: ["visitSchedule"], required: true },
  date: { type: String, required: false },
  coachingActionPlanId: { type: String, required: true },
  coachId: { type: String, required: true },
  cycleId: { type: String, required: true },
  bellScheduleId: { type: String, required: true },
  timeBlocks: [VisitScheduleBlockSchema],
};

const VisitScheduleSchema = new mongoose.Schema(visitScheduleFields, {
  ...standardSchemaOptions,
  collection: "visitschedules",
});

// =====================================
// MODEL EXPORTS
// =====================================

export const BellScheduleModel =
  mongoose.models.BellSchedule ||
  mongoose.model("BellSchedule", BellScheduleSchema);

export const TeacherScheduleModel =
  mongoose.models.TeacherSchedule ||
  mongoose.model("TeacherSchedule", TeacherScheduleSchema);

export const VisitScheduleModel =
  mongoose.models.VisitSchedule ||
  mongoose.model("VisitSchedule", VisitScheduleSchema);

// =====================================
// LEGACY EXPORTS (for backward compatibility)
// =====================================

/** @deprecated Use BellScheduleModel instead */
export const BellSchedule = BellScheduleModel;

/** @deprecated Use TeacherScheduleModel instead */
export const TeacherSchedule = TeacherScheduleModel;

/** @deprecated Use VisitScheduleModel instead */
export const VisitSchedule = VisitScheduleModel;
