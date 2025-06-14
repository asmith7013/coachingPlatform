import mongoose from "mongoose";
import { DurationValues, ScheduleAssignment } from "@enums";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  periodNum: { type: Number }
}, { _id: false });

const plannedVisitFields = {
  teacherId: { type: String, required: true },
  timeSlot: { type: TimeSlotSchema, required: true },
  purpose: { type: String, required: true },
  duration: { type: String, enum: DurationValues, required: true },
  date: { type: Date, required: true },
  coach: { type: String, required: true },
  assignmentType: { type: String, enum: Object.values(ScheduleAssignment), default: ScheduleAssignment.FULL_PERIOD },
  customPurpose: { type: Boolean, default: false },
  school: { type: String },
  periodNum: { type: Number },
  notes: { type: String },
  scheduleId: { type: String },
  orderIndex: { type: Number },
  ...standardDocumentFields
};

const PlannedVisitSchema = new mongoose.Schema(plannedVisitFields, {
  ...standardSchemaOptions,
  collection: 'plannedvisits'
});

export const PlannedVisitModel = mongoose.models.PlannedVisit || 
  mongoose.model("PlannedVisit", PlannedVisitSchema);

export async function getPlannedVisitModel() {
  return PlannedVisitModel;
} 