// src/lib/schema/mongoose-schema/scm/podsie/assignment-variation.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { SCOPE_SEQUENCE_TAG_OPTIONS } from '@schema/enum/scm';

// =====================================
// ASSIGNMENT VARIATION MODEL
// =====================================

/**
 * Assignment Variation - a "Version B" copy of an existing Podsie assignment
 *
 * These are static, state-test-style questions:
 * - Plain text question prompts
 * - Optional static visuals (tables, graphs as HTML/SVG)
 * - Clear acceptance criteria for grading
 * - NO interactive elements
 */

// Question sub-schema
const questionVariationSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    min: 1,
    description: "Question number (1, 2, 3...)"
  },
  questionTitle: {
    type: String,
    required: true,
    maxLength: 80,
    description: "Short descriptive title"
  },
  contextScenario: {
    type: String,
    required: false,
    description: "Introductory text/scenario (if any)"
  },
  questionText: {
    type: String,
    required: true,
    description: "The actual question prompt"
  },
  visualType: {
    type: String,
    enum: ["none", "table", "graph", "diagram"],
    default: "none",
    description: "Type of static visual"
  },
  visualHtml: {
    type: String,
    required: false,
    description: "Static HTML for table or SVG for graph"
  },
  visualDescription: {
    type: String,
    required: false,
    description: "Alt text / description of the visual"
  },
  acceptanceCriteria: {
    type: [String],
    required: true,
    description: "Conditions for correct response"
  },
  correctAnswer: {
    type: String,
    required: true,
    description: "The correct answer"
  },
  acceptableAnswerForms: {
    type: [String],
    required: false,
    description: "Equivalent forms accepted"
  },
  explanation: {
    type: String,
    required: true,
    description: "Guidance for AI tutor - hints, common misconceptions"
  },
  solutionSteps: {
    type: [String],
    required: false,
    description: "Step-by-step solution process"
  }
}, { _id: false });

const assignmentVariationSchema = new mongoose.Schema({
  // =====================================
  // IDENTIFYING INFO
  // =====================================
  title: {
    type: String,
    required: true,
    description: "Assignment title"
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    description: "URL-friendly identifier"
  },

  // =====================================
  // SCOPE AND SEQUENCE REFERENCE
  // =====================================
  scopeSequenceTag: {
    type: String,
    required: true,
    enum: SCOPE_SEQUENCE_TAG_OPTIONS,
    description: "Scope and sequence tag"
  },
  grade: {
    type: String,
    required: true,
    description: "Grade level"
  },
  unitNumber: {
    type: Number,
    required: true,
    min: 1,
    description: "Unit number"
  },
  lessonNumber: {
    type: Number,
    required: true,
    description: "Lesson number"
  },
  scopeAndSequenceId: {
    type: String,
    required: false,
    description: "MongoDB ObjectId of scope-and-sequence document"
  },
  section: {
    type: String,
    enum: ["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"],
    required: false,
    description: "Lesson section within the unit"
  },

  // =====================================
  // ORIGINAL ASSIGNMENT REFERENCE
  // =====================================
  originalAssignmentName: {
    type: String,
    required: false,
    description: "Name of the original Podsie assignment"
  },
  originalPodsieAssignmentId: {
    type: String,
    required: false,
    description: "Podsie assignment UUID if known"
  },

  // =====================================
  // QUESTIONS
  // =====================================
  questions: {
    type: [questionVariationSchema],
    required: true,
    description: "Array of question variations"
  },

  // =====================================
  // METADATA
  // =====================================
  generatedBy: {
    type: String,
    enum: ["ai", "manual"],
    default: "ai",
    description: "How this variation was generated"
  },
  sourceImage: {
    type: String,
    required: false,
    description: "Filename of source screenshot"
  },
  isPublic: {
    type: Boolean,
    default: true,
    description: "Whether this variation is publicly visible"
  },
  notes: {
    type: String,
    required: false,
    description: "Optional notes about this variation"
  },

  ...standardDocumentFields
}, {
  ...standardSchemaOptions,
  collection: 'assignment-variations'
});

// Indexes
assignmentVariationSchema.index({ slug: 1 }, { unique: true });
assignmentVariationSchema.index({ scopeSequenceTag: 1, grade: 1 });
assignmentVariationSchema.index({ unitNumber: 1, lessonNumber: 1 });
assignmentVariationSchema.index({ scopeAndSequenceId: 1 });

export const AssignmentVariationModel = mongoose.models.AssignmentVariation || mongoose.model('AssignmentVariation', assignmentVariationSchema);
