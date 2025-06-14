import mongoose from 'mongoose';
import {
  AllowedPurposes,
  SessionPurposes,
  ModeDone,
  GradeLevels,
  DurationValues,
  ScheduleAssignment,
} from '@enums';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  periodNum: { type: Number }
}, { _id: false });

const EventItemSchema = new mongoose.Schema({
  eventType: { type: String, enum: Object.values(SessionPurposes), required: true },
  staffIds: [{ type: String, required: true }],
  duration: { type: String, enum: DurationValues, required: true },
  timeSlot: { type: TimeSlotSchema },
  purpose: { type: String, enum: Object.values(SessionPurposes) },
  periodNumber: { type: Number },
  portion: { type: String, enum: Object.values(ScheduleAssignment) },
  orderIndex: { type: Number },
  notes: { type: String }
}, { _id: false });

const SessionLinkSchema = new mongoose.Schema({
  purpose: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  staffIds: [{ type: String, required: true }]
}, { _id: false });

const visitFields = {
  date: { type: Date, required: true },
  schoolId: { type: String, required: true },
  coachId: { type: String, required: true },
  cycleId: { type: String },
  allowedPurpose: { type: String, enum: Object.values(AllowedPurposes) },
  modeDone: { type: String, enum: Object.values(ModeDone) },
  gradeLevelsSupported: [{ type: String, enum: Object.values(GradeLevels), default: [] }],
  events: [EventItemSchema],
  sessionLinks: [SessionLinkSchema],
  plannedScheduleId: { type: String },
  mondayItemId: { type: String },
  mondayBoardId: { type: String },
  mondayItemName: { type: String },
  mondayLastSyncedAt: { type: Date },
  siteAddress: { type: String },
  endDate: { type: Date },
  ...standardDocumentFields
};

const VisitSchema = new mongoose.Schema(visitFields, {
  ...standardSchemaOptions,
  collection: 'visits'
});

export const VisitModel = mongoose.models.Visit || 
  mongoose.model('Visit', VisitSchema);