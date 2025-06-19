import mongoose from 'mongoose';
import { 
  SessionPurposes,
  ScheduleAssignment,
  PeriodTypes,
  GradeLevels
} from '@enums';

// =====================================
// STANDALONE EVENT BLOCK SCHEMAS
// =====================================
// These schemas represent the time block structures used within schedule documents

const BaseTimeBlockSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  periodName: { type: String },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number },
  room: { type: String },
  notes: { type: String }
}, { _id: false });

// =====================================
// BELL SCHEDULE BLOCK
// =====================================

export const BellScheduleBlockSchema = new mongoose.Schema({
  ...BaseTimeBlockSchema.obj,
  blockType: { type: String, enum: ['bellScheduleBlock'], required: true }
}, { _id: false });

// =====================================
// TEACHER SCHEDULE BLOCK
// =====================================

export const TeacherScheduleBlockSchema = new mongoose.Schema({
  ...BaseTimeBlockSchema.obj,
  blockType: { type: String, enum: ['teacherScheduleBlock'], required: true },
  className: { type: String, required: true },
  room: { type: String },
  activityType: { type: String, enum: Object.values(PeriodTypes), required: true },
  subject: { type: String },
  gradeLevel: { type: String, enum: Object.values(GradeLevels) }
}, { _id: false });

// =====================================
// VISIT SCHEDULE BLOCK
// =====================================

export const VisitScheduleBlockSchema = new mongoose.Schema({
  ...BaseTimeBlockSchema.obj,
  blockType: { type: String, enum: ['visitScheduleBlock'], required: true },
  orderIndex: { type: Number, required: true },
  eventType: { type: String, enum: Object.values(SessionPurposes), required: true },
  staffIds: [{ type: String, required: true }],
  portion: { type: String, enum: Object.values(ScheduleAssignment), required: true }
}, { _id: false });

// =====================================
// BACKWARD COMPATIBILITY SCHEMAS
// =====================================

/** @deprecated Use VisitScheduleBlockSchema instead */
const EventFieldsSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  periodNumber: { type: Number, required: true },
  orderIndex: { type: Number, required: true },
  eventType: { type: String, enum: Object.values(SessionPurposes), required: true },
  staffIds: [{ type: String, required: true }],
  portion: { type: String, enum: Object.values(ScheduleAssignment), required: true },
  room: { type: String },
  duration: { type: Number },
  notes: { type: String },
  timeSlot: {
    periodNumber: { type: Number },
    startTime: { type: String },
    endTime: { type: String },
    periodName: { type: String }
  },
  actualStartTime: { type: String },
  actualEndTime: { type: String }
}, { _id: false });

// =====================================
// LEGACY EXPORTS
// =====================================

/** @deprecated Use VisitScheduleBlockSchema instead */
export const EventItemSchema = EventFieldsSchema;

/** @deprecated Use BaseTimeBlockSchema instead */
export const TimeBlockFieldsSchema = BaseTimeBlockSchema;
