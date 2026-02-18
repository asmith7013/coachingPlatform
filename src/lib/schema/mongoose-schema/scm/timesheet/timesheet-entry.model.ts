// src/lib/schema/mongoose-schema/scm/timesheet/timesheet-entry.model.ts
import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "../../shared-options";

/**
 * Timesheet Entry Schema
 * Each document represents a single row from the timesheet form submission
 */
const timesheetEntryFields = {
  // Date of the work (YYYY-MM-DD format)
  date: {
    type: String,
    required: true,
    index: true,
  },

  // Task - the type of work performed
  task: {
    type: String,
    required: true,
  },

  // Project - the project this work was for
  project: {
    type: String,
    required: true,
    index: true,
  },

  // Hours worked
  hours: {
    type: Number,
    required: true,
    min: 0,
  },

  // Hourly rate
  rate: {
    type: Number,
    required: true,
    min: 0,
  },

  // Calculated total pay (hours * rate)
  totalPay: {
    type: Number,
    required: true,
    min: 0,
  },

  // When the entry was submitted to the external system
  submittedAt: {
    type: Date,
    default: Date.now,
  },

  // Standard document fields (ownerIds)
  ...standardDocumentFields,
};

const TimesheetEntrySchema = new mongoose.Schema(timesheetEntryFields, {
  ...standardSchemaOptions,
  collection: "timesheet-entries",
});

// Compound index for efficient date range queries
TimesheetEntrySchema.index({ date: 1, project: 1 });

// Index for sorting by submission time
TimesheetEntrySchema.index({ submittedAt: -1 });

export const TimesheetEntryModel =
  mongoose.models.TimesheetEntry ||
  mongoose.model("TimesheetEntry", TimesheetEntrySchema);
