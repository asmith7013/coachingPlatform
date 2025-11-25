// src/lib/schema/mongoose-schema/313/section-config.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { Schools, AllSections, Teachers313 } from '@schema/enum/313';

// =====================================
// SECTION CONFIG MODEL
// =====================================

const podsieAssignmentSchema = new mongoose.Schema({
  unitLessonId: { type: String, required: true },
  lessonName: { type: String, required: true },
  grade: { type: String, required: false },

  podsieAssignmentId: { type: String, required: true },
  podsieQuestionMap: [{
    questionNumber: { type: Number, required: true },
    questionId: { type: String, required: true }
  }],
  totalQuestions: { type: Number, required: false },

  active: { type: Boolean, default: true },
  notes: { type: String, required: false }
}, { _id: false });

const sectionConfigFields = {
  // Section metadata
  school: { type: String, required: true, enum: Schools, index: true },
  classSection: { type: String, required: true, enum: AllSections, index: true },
  teacher: { type: String, required: false, enum: Teachers313, index: true },
  gradeLevel: { type: String, required: true, index: true },
  scopeSequenceTag: {
    type: String,
    required: false,
    enum: ['Grade 6', 'Grade 7', 'Grade 8', 'Algebra 1'],
    index: true
  },

  active: { type: Boolean, default: true, index: true },

  // Podsie assignment configurations
  podsieAssignments: { type: [podsieAssignmentSchema], default: [] },

  // Metadata
  notes: { type: String, required: false },

  ...standardDocumentFields
};

const SectionConfigSchema = new mongoose.Schema(sectionConfigFields, {
  ...standardSchemaOptions,
  collection: 'section-configs'
});

// Create indexes for efficient queries
// Unique index: one config per school + classSection
SectionConfigSchema.index(
  { school: 1, classSection: 1 },
  { unique: true }
);

// Query by school (get all sections in a school)
SectionConfigSchema.index({ school: 1, active: 1 });

// Query by teacher (get all sections for a teacher)
SectionConfigSchema.index({ teacher: 1, active: 1 });

// Query by grade level
SectionConfigSchema.index({ gradeLevel: 1, active: 1 });

// Query assignments by unitLessonId (for lookups)
SectionConfigSchema.index({ 'podsieAssignments.unitLessonId': 1 });

// Delete existing model to force schema refresh
if (mongoose.models.SectionConfig) {
  delete mongoose.models.SectionConfig;
}

export const SectionConfigModel = mongoose.model('SectionConfig', SectionConfigSchema);
