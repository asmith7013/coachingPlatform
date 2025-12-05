import mongoose, { Schema, Model } from 'mongoose';
import type { AttendanceRecord } from '@zod-schema/313/student/attendance';

/**
 * Mongoose schema for student attendance records
 *
 * Design considerations:
 * - Separate collection for efficient querying across students and date ranges
 * - Compound index on studentId + date for fast lookups
 * - Index on section + date for class roster queries
 * - Index on date for date range queries across all students
 */
const AttendanceSchema = new Schema<AttendanceRecord>(
  {
    studentId: {
      type: Number,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'not-tracked'],
      required: true,
    },
    section: {
      type: String,
      required: true,
      index: true,
    },
    blockType: {
      type: String,
      enum: ['single', 'double'],
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    syncedFrom: {
      type: String,
      enum: ['podsie', 'manual', 'import'],
      required: false,
    },
    lastSyncedAt: {
      type: String,
      required: false,
    },
    ownerIds: [{
      type: String,
      required: false,
    }],
  },
  {
    timestamps: true,
    collection: 'attendance-313',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// =====================================
// INDEXES
// =====================================

// Compound index for student + date lookups (most common query)
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Index for section + date queries (get class roster attendance)
AttendanceSchema.index({ section: 1, date: 1 });

// Index for date range queries
AttendanceSchema.index({ date: 1 });

// =====================================
// MODEL EXPORT
// =====================================

// Clear existing model in development to avoid OverwriteModelError
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models['Attendance313'];
}

export const Attendance313: Model<AttendanceRecord> =
  mongoose.models['Attendance313'] ||
  mongoose.model<AttendanceRecord>('Attendance313', AttendanceSchema);

export default Attendance313;
