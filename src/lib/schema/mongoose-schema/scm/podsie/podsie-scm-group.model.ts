// src/lib/schema/mongoose-schema/scm/podsie/podsie-scm-group.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// PODSIE SCM GROUP MODEL
// =====================================
// Stores pacing configuration for Podsie assignments within a module,
// per group (class section). Used by Podsie sandbox pages.
// Renamed from lesson-progress to reflect broader scope beyond just pacing.

// Assignment pacing entry subdocument schema
const pacingEntrySchema = new mongoose.Schema({
  podsieAssignmentId: { type: Number, required: true },
  dueDate: { type: String, required: false }, // "YYYY-MM-DD" format or null
  groupNumber: { type: Number, required: false, min: 1, max: 20 }, // null = ungrouped
  groupLabel: { type: String, required: false }, // e.g., "Part 1", "Week 1"
  orderIndex: { type: Number, required: false }, // Order within the group (0-based)
  assignmentTitle: { type: String, required: false },
  zearnLessonCode: { type: String, required: false }, // e.g. "G8 M4 L2"
}, { _id: false });

const podsieScmGroupFields = {
  // Composite key: unique per group + module
  podsieGroupId: { type: Number, required: true, index: true },
  podsieModuleId: { type: Number, required: true, index: true },

  // Start date for the module/unit - used to calculate Section A's active period
  moduleStartDate: { type: String, required: false }, // "YYYY-MM-DD" format

  // Points reward: goal and description (e.g. 750 points → "Pizza party")
  pointsRewardGoal: { type: Number, required: false },
  pointsRewardDescription: { type: String, required: false },

  // Pacing configuration - array of assignment entries
  assignments: { type: [pacingEntrySchema], default: [] },

  // Group numbers of sections marked complete by the teacher
  completedSections: { type: [Number], default: [] },

  ...standardDocumentFields
};

const PodsieScmGroupSchema = new mongoose.Schema(podsieScmGroupFields, {
  ...standardSchemaOptions,
  collection: 'podsie-scm-groups'
});

// Unique index: one pacing config per group + module
PodsieScmGroupSchema.index(
  { podsieGroupId: 1, podsieModuleId: 1 },
  { unique: true }
);

// Delete existing model to force schema refresh during development
if (mongoose.models.PodsieScmGroup) {
  delete mongoose.models.PodsieScmGroup;
}

export const PodsieScmGroupModel = mongoose.model('PodsieScmGroup', PodsieScmGroupSchema);
