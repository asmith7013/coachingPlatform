// src/lib/schema/mongoose-schema/scm/podsie/assignment-pacing.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ASSIGNMENT PACING MODEL
// =====================================
// Stores pacing configuration for Podsie assignments within a module,
// per group (class section). Used by Podsie sandbox pages.

// Assignment pacing entry subdocument schema
const assignmentPacingEntrySchema = new mongoose.Schema({
  podsieAssignmentId: { type: Number, required: true },
  dueDate: { type: String, required: false }, // "YYYY-MM-DD" format or null
  groupNumber: { type: Number, required: false, min: 1, max: 20 }, // null = ungrouped
  groupLabel: { type: String, required: false } // e.g., "Part 1", "Week 1"
}, { _id: false });

const assignmentPacingFields = {
  // Composite key: unique per group + module
  podsieGroupId: { type: Number, required: true, index: true },
  podsieModuleId: { type: Number, required: true, index: true },

  // Pacing configuration - array of assignment entries
  assignments: { type: [assignmentPacingEntrySchema], default: [] },

  ...standardDocumentFields
};

const AssignmentPacingSchema = new mongoose.Schema(assignmentPacingFields, {
  ...standardSchemaOptions,
  collection: 'assignment-pacing'
});

// Unique index: one pacing config per group + module
AssignmentPacingSchema.index(
  { podsieGroupId: 1, podsieModuleId: 1 },
  { unique: true }
);

// Delete existing model to force schema refresh during development
if (mongoose.models.AssignmentPacing) {
  delete mongoose.models.AssignmentPacing;
}

export const AssignmentPacingModel = mongoose.model('AssignmentPacing', AssignmentPacingSchema);
