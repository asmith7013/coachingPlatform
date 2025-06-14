import mongoose from "mongoose";
import {
  DayTypes,
  BlockDayTypes,
  BellScheduleTypes,
  PeriodTypes,
} from "@enums";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const ClassScheduleItemSchema = new mongoose.Schema({
  dayType: { type: String, enum: Object.values(DayTypes), required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, { _id: false });

const AssignedCycleDaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  blockDayType: { type: String, enum: Object.values(BlockDayTypes), required: true }
}, { _id: false });

const BellScheduleSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  bellScheduleType: { type: String, enum: Object.values(BellScheduleTypes), required: true },
  classSchedule: { type: [ClassScheduleItemSchema], required: true },
  assignedCycleDays: { type: [AssignedCycleDaySchema], required: true },
  ...standardDocumentFields
}, {
  ...standardSchemaOptions,
  collection: 'bellschedules'
});

const PeriodSchema = new mongoose.Schema({
  periodNum: { type: Number, required: true },
  className: { type: String, required: true },
  room: { type: String },
  periodType: { type: String, enum: Object.values(PeriodTypes), required: true }
}, { _id: false });

const ScheduleByDaySchema = new mongoose.Schema({
  day: { type: String, enum: Object.values(DayTypes), required: true },
  periods: { type: [PeriodSchema], required: true }
}, { _id: false });

const TeacherScheduleSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  schoolId: { type: String, required: true },
  scheduleByDay: { type: [ScheduleByDaySchema], required: true },
  ...standardDocumentFields
}, {
  ...standardSchemaOptions,
  collection: 'teacherschedules'
});

export const ClassScheduleItemModel =
  mongoose.models.ClassScheduleItem || mongoose.model("ClassScheduleItem", ClassScheduleItemSchema);

export const AssignedCycleDayModel =
  mongoose.models.AssignedCycleDay || mongoose.model("AssignedCycleDay", AssignedCycleDaySchema);

export const BellScheduleModel = mongoose.models.BellSchedule || 
  mongoose.model("BellSchedule", BellScheduleSchema);

export const PeriodModel =
  mongoose.models.Period || mongoose.model("Period", PeriodSchema);

export const ScheduleByDayModel =
  mongoose.models.ScheduleByDay || mongoose.model("ScheduleByDay", ScheduleByDaySchema);

export const TeacherScheduleModel = mongoose.models.TeacherSchedule || 
  mongoose.model("TeacherSchedule", TeacherScheduleSchema);

export async function getClassScheduleItemModel() {
  return ClassScheduleItemModel;
}

export async function getAssignedCycleDayModel() {
  return AssignedCycleDayModel;
}

export async function getBellScheduleModel() {
  return BellScheduleModel;
}

export async function getPeriodModel() {
  return PeriodModel;
}

export async function getScheduleByDayModel() {
  return ScheduleByDayModel;
}

export async function getTeacherScheduleModel() {
  return TeacherScheduleModel;
}
