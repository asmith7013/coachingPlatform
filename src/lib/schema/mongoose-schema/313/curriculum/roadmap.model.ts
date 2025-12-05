// src/lib/schema/mongoose-schema/313/roadmap.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ROADMAPS LESSON MODEL
// =====================================

const practiceProblemSchema = {
  problemNumber: { type: Number, required: true },
  screenshotUrl: { type: String, required: true },
  scrapedAt: { type: String, required: true },
};

const roadmapsLessonFields = {
  // Core identification
  title: { type: String, required: true, index: true },
  url: { type: String, required: true, unique: true, index: true },
  skillNumber: { type: String, index: true },

  // Content sections
  description: { type: String, default: '' },
  skillChallengeCriteria: { type: String, default: '' },
  essentialQuestion: { type: String, default: '' },

  // Teaching strategies and resources
  launch: { type: String, default: '' },
  teacherStudentStrategies: { type: String, default: '' },
  modelsAndManipulatives: { type: String, default: '' },
  questionsToHelp: { type: String, default: '' },
  discussionQuestions: { type: String, default: '' },
  commonMisconceptions: { type: String, default: '' },
  additionalResources: { type: String, default: '' },

  // Standards and vocabulary
  standards: { type: String, default: '' },
  vocabulary: { type: [String], default: [] },

  // Media and resources
  images: { type: [String], default: [] },
  videoUrl: { type: String, default: null },
  practiceProblems: { type: [practiceProblemSchema], default: [] },
  
  // Metadata
  scrapedAt: { type: String, required: true, index: true },
  success: { type: Boolean, required: true, index: true },
  error: { type: String },
  
  // Organization
  tags: { type: [String], default: [], index: true },
  
  ...standardDocumentFields
};

const RoadmapsLessonSchema = new mongoose.Schema(roadmapsLessonFields, {
  ...standardSchemaOptions,
  collection: 'roadmaps-lesson'
});

// Force recompilation of the model to ensure videoUrl field is included
if (mongoose.models.RoadmapsLesson) {
  delete mongoose.models.RoadmapsLesson;
}

export const RoadmapsLessonModel = mongoose.model('RoadmapsLesson', RoadmapsLessonSchema);
