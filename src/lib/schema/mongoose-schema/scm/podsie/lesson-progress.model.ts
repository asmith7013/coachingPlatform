// src/lib/schema/mongoose-schema/scm/podsie/lesson-progress.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// LESSON PROGRESS PACING MODEL
// =====================================
// Stores pacing configuration for Podsie assignments within a module,
// per group (class section). Used by Podsie sandbox pages.

// Assignment pacing entry subdocument schema
const lessonProgressEntrySchema = new mongoose.Schema({
  podsieAssignmentId: { type: Number, required: true },
  dueDate: { type: String, required: false }, // "YYYY-MM-DD" format or null
  groupNumber: { type: Number, required: false, min: 1, max: 20 }, // null = ungrouped
  groupLabel: { type: String, required: false } // e.g., "Part 1", "Week 1"
}, { _id: false });

const lessonProgressFields = {
  // Composite key: unique per group + module
  podsieGroupId: { type: Number, required: true, index: true },
  podsieModuleId: { type: Number, required: true, index: true },

  // Start date for the module/unit - used to calculate Section A's active period
  moduleStartDate: { type: String, required: false }, // "YYYY-MM-DD" format

  // Pacing configuration - array of assignment entries
  assignments: { type: [lessonProgressEntrySchema], default: [] },

  ...standardDocumentFields
};

const LessonProgressSchema = new mongoose.Schema(lessonProgressFields, {
  ...standardSchemaOptions,
  collection: 'lesson-progress'
});

// Unique index: one pacing config per group + module
LessonProgressSchema.index(
  { podsieGroupId: 1, podsieModuleId: 1 },
  { unique: true }
);

// Delete existing model to force schema refresh during development
if (mongoose.models.LessonProgress) {
  delete mongoose.models.LessonProgress;
}

export const LessonProgressModel = mongoose.model('LessonProgress', LessonProgressSchema);
