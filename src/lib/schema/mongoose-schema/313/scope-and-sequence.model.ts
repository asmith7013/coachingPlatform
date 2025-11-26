// src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// SCOPE AND SEQUENCE TAG ENUM
// =====================================

const SCOPE_SEQUENCE_TAG_VALUES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Algebra 1",
  "Geometry",
  "Algebra 2",
  "Pre-Calculus",
  "Statistics",
] as const;

// =====================================
// SCOPE AND SEQUENCE MODEL
// =====================================

const SECTION_VALUES = ["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"] as const;

const scopeAndSequenceFields = {
  grade: { type: String, required: true, index: true },
  unit: { type: String, required: true, index: true },
  unitLessonId: { type: String, required: true, index: true },
  unitNumber: { type: Number, required: true, index: true },
  lessonNumber: { type: Number, required: true, index: true },
  lessonName: { type: String, required: true },
  section: { type: String, required: false, enum: SECTION_VALUES, index: true },
  scopeSequenceTag: {
    type: String,
    required: false,
    index: true,
    enum: SCOPE_SEQUENCE_TAG_VALUES
  },
  roadmapSkills: { type: [String], default: [] },
  targetSkills: { type: [String], default: [] },
  standards: { type: [String], default: [] },

  ...standardDocumentFields
};

const ScopeAndSequenceSchema = new mongoose.Schema(scopeAndSequenceFields, {
  ...standardSchemaOptions,
  collection: 'scope-and-sequence'
});

// Create compound indexes for efficient queries
ScopeAndSequenceSchema.index({ grade: 1, unitNumber: 1, lessonNumber: 1 });

// Create compound unique index to ensure uniqueness across grade + unitLessonId + scopeSequenceTag + section
// This allows same unitLessonId for different sections (e.g., "3.2" can be both a Section A lesson and a Ramp Up)
ScopeAndSequenceSchema.index(
  { grade: 1, unitLessonId: 1, scopeSequenceTag: 1, section: 1 },
  { unique: true, sparse: true } // sparse: true allows multiple docs with null scopeSequenceTag or section
);

// Delete existing model to force schema refresh (ensures new fields are recognized)
if (mongoose.models.ScopeAndSequence) {
  delete mongoose.models.ScopeAndSequence;
}

export const ScopeAndSequenceModel = mongoose.model('ScopeAndSequence', ScopeAndSequenceSchema);
