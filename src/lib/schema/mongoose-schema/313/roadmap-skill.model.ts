// src/lib/schema/mongoose-schema/313/roadmap-skill.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ROADMAPS SKILL MODEL (Comprehensive)
// =====================================

const skillReferenceSchema = {
  title: { type: String, required: true },
  skillNumber: { type: String, required: true },
};

const unitReferenceSchema = {
  grade: { type: String, required: true },
  unitTitle: { type: String, required: true },
  unitNumber: { type: Number, required: true },
};

const practiceProblemSchema = {
  problemNumber: { type: Number, required: true },
  screenshotUrl: { type: String, required: true },
  scrapedAt: { type: String, required: true },
};

const imageWithContextSchema = {
  url: { type: String, required: true },
  altText: { type: String },
  caption: { type: String },
  section: { type: String },
  orderInSection: { type: Number, required: true },
};

const imLessonSchema = {
  unitNumber: { type: Number, required: true },
  lessonNumber: { type: Number, required: true },
  lessonName: { type: String },
};

const vocabularyTermSchema = {
  term: { type: String, required: true },
  definition: { type: String, required: true },
};

const roadmapsSkillFields = {
  // Core identification
  skillNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, index: true },
  url: { type: String, index: true },

  // Prerequisites - structured with skillNumber and title
  essentialSkills: { type: [skillReferenceSchema], default: [] },
  helpfulSkills: { type: [skillReferenceSchema], default: [] },

  // Which units contain this skill
  units: { type: [unitReferenceSchema], default: [] },

  // Pre-computed relationships - where this skill appears
  appearsIn: {
    type: {
      asTarget: { type: [unitReferenceSchema], default: [] },
      asEssential: {
        type: [{
          skillNumber: { type: String, required: true },
          title: { type: String, required: true },
          units: { type: [unitReferenceSchema], default: [] }
        }],
        default: []
      },
      asHelpful: {
        type: [{
          skillNumber: { type: String, required: true },
          title: { type: String, required: true },
          units: { type: [unitReferenceSchema], default: [] }
        }],
        default: []
      },
      asSupport: { type: [unitReferenceSchema], default: [] }
    },
    required: false
  },

  // IM Lesson fields (optional for skills from IM lessons)
  section: { type: String },
  lesson: { type: Number }, // Deprecated: use imLessons for multiple
  lessonName: { type: String },
  grade: { type: String, index: true },
  unit: { type: String },
  learningTargets: { type: String },
  suggestedTargetSkills: { type: [String], default: [] },

  // IM Lesson mappings - skills can appear in multiple lessons
  imLessons: { type: [imLessonSchema], default: [] },

  // Content sections
  description: { type: String, default: '' },
  skillChallengeCriteria: { type: String, default: '' },
  essentialQuestion: { type: String, default: '' },

  // Complete primer section HTML with column layout preserved
  primerHtml: { type: String, default: '' },

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
  vocabulary: { type: [vocabularyTermSchema], default: [] },

  // Media and resources
  images: { type: [String], default: [] }, // Deprecated: Use imagesWithContext instead
  imagesWithContext: { type: [imageWithContextSchema], default: [] },
  videoUrl: { type: String },
  practiceProblems: { type: [practiceProblemSchema], default: [] },

  // Organization
  tags: { type: [String], default: [], index: true },

  // Metadata
  scrapedAt: { type: String, required: true, index: true },
  success: { type: Boolean, required: true, default: true, index: true },
  error: { type: String },

  ...standardDocumentFields
};

const RoadmapsSkillSchema = new mongoose.Schema(roadmapsSkillFields, {
  ...standardSchemaOptions,
  collection: 'roadmaps-skills'
});

export const RoadmapsSkillModel = mongoose.models.RoadmapsSkill ||
  mongoose.model('RoadmapsSkill', RoadmapsSkillSchema);
