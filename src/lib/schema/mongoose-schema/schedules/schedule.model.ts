import mongoose from "mongoose";
import { BlockDayTypes, BellScheduleTypes, PeriodTypes } from "@enums";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const TimeBlockSchema = new mongoose.Schema(
  {
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    periodName: { type: String },
  },
  { _id: false },
);

const AssignedCycleDaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    blockDayType: {
      type: String,
      enum: Object.values(BlockDayTypes),
      required: true,
    },
  },
  { _id: false },
);

const BellScheduleSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true },
    name: { type: String, required: true },
    bellScheduleType: {
      type: String,
      enum: Object.values(BellScheduleTypes),
      required: true,
    },
    timeBlocks: [TimeBlockSchema],
    assignedCycleDays: { type: [AssignedCycleDaySchema], required: true },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "bellschedules",
  },
);

const PeriodSchema = new mongoose.Schema(
  {
    periodNum: { type: Number, required: true },
    className: { type: String, required: true },
    room: { type: String },
    periodType: {
      type: String,
      enum: Object.values(PeriodTypes),
      required: true,
    },
  },
  { _id: false },
);

const PeriodByTeacherSchema = new mongoose.Schema(
  {
    periodNumber: { type: Number, required: true },
    className: { type: String, required: true },
    room: { type: String, required: true },
    activityType: {
      type: String,
      enum: Object.values(PeriodTypes),
      required: true,
    },
    subject: { type: String },
    gradeLevel: { type: String },
  },
  { _id: false },
);

const TeacherScheduleSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    schoolId: { type: String, required: true },
    bellScheduleId: { type: String, required: true },
    assignments: [PeriodByTeacherSchema],
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "teacherschedules",
  },
);

export const BellScheduleModel =
  mongoose.models.BellSchedule ||
  mongoose.model("BellSchedule", BellScheduleSchema);

export const AssignedCycleDayModel =
  mongoose.models.AssignedCycleDay ||
  mongoose.model("AssignedCycleDay", AssignedCycleDaySchema);

export const PeriodModel =
  mongoose.models.Period || mongoose.model("Period", PeriodSchema);

export const TeacherScheduleModel =
  mongoose.models.TeacherSchedule ||
  mongoose.model("TeacherSchedule", TeacherScheduleSchema);
