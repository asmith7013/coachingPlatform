// src/lib/schema/mongoose-schema/scm/podsie-completion.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { Schools, AllSections } from '@schema/enum/313';

// =====================================
// PODSIE COMPLETION MODEL
// =====================================

const podsieCompletionFields = {
  // Identifiers
  school: { type: String, required: true, enum: Schools, index: true },
  classSection: { type: String, required: true, enum: AllSections, index: true },

  // Reference to scope-and-sequence
  scopeAndSequenceId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'ScopeAndSequence' },

  // Denormalized for easy querying
  unitLessonId: { type: String, required: true, index: true },
  grade: { type: String, required: false },
  lessonName: { type: String, required: false },

  // Podsie integration data
  podsieAssignmentId: { type: String, required: true, index: true },
  podsieQuestionMap: [{
    questionNumber: { type: Number, required: true },
    questionId: { type: String, required: true }
  }],
  totalQuestions: { type: Number, required: false },

  // Metadata
  active: { type: Boolean, default: true, index: true },
  notes: { type: String, required: false },

  ...standardDocumentFields
};

const PodsieCompletionSchema = new mongoose.Schema(podsieCompletionFields, {
  ...standardSchemaOptions,
  collection: 'podsie-completion'
});

// Create compound indexes for efficient queries
// Unique index: one config per school + section + lesson
PodsieCompletionSchema.index(
  { school: 1, classSection: 1, unitLessonId: 1 },
  { unique: true }
);

// Query by school + section (get all configs for a class)
PodsieCompletionSchema.index({ school: 1, classSection: 1, active: 1 });

// Query by podsieAssignmentId (reverse lookup)
PodsieCompletionSchema.index({ podsieAssignmentId: 1 });

// Delete existing model to force schema refresh
if (mongoose.models.PodsieCompletion) {
  delete mongoose.models.PodsieCompletion;
}

export const PodsieCompletionModel = mongoose.model('PodsieCompletion', PodsieCompletionSchema);
