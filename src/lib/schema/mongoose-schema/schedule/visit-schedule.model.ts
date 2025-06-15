import mongoose from 'mongoose';
import {
  SessionPurposes,
  ScheduleAssignment,
} from '@enums';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const VisitEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  periodNumber: { type: Number, required: true },
  orderIndex: { type: Number, required: true },
  eventType: { type: String, enum: Object.values(SessionPurposes), required: true },
  teacherIds: [{ type: String, required: true }],
  portion: { type: String, enum: Object.values(ScheduleAssignment), required: true },
  room: { type: String },
  duration: { type: Number },
  notes: { type: String },
  actualStartTime: { type: String },
  actualEndTime: { type: String }
}, { _id: false });

const visitScheduleFields = {
  coachingActionPlanId: { type: String, required: true },
  date: { type: String },
  coachId: { type: String, required: true },
  schoolId: { type: String, required: true },
  bellScheduleId: { type: String, required: true },
  events: [VisitEventSchema],
  ...standardDocumentFields
};

const VisitScheduleSchema = new mongoose.Schema(visitScheduleFields, {
  ...standardSchemaOptions,
  collection: 'visitschedules'
});

export const VisitScheduleModel = mongoose.models.VisitSchedule || 
  mongoose.model('VisitSchedule', VisitScheduleSchema); 