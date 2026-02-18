// src/lib/schema/mongoose-schema/scm/podsie/learning-content.model.ts
import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@schema/enum/scm";

// =====================================
// LEARNING CONTENT MODEL
// =====================================

/**
 * Learning Content - stores "What We're Learning" content for a specific unit section
 *
 * This content is displayed on the Smartboard Display on the Podsie Progress page
 * and allows teachers to customize learning objectives for each unit section.
 */

const learningContentSchema = new mongoose.Schema(
  {
    // =====================================
    // IDENTIFYING KEYS
    // =====================================

    scopeSequenceTag: {
      type: String,
      required: true,
      enum: SCOPE_SEQUENCE_TAG_OPTIONS,
      description: "Scope and sequence tag (e.g., 'Grade 8', 'Algebra 1')",
    },
    grade: {
      type: String,
      required: true,
      description: "Grade level (e.g., '6', '7', '8')",
    },
    unit: {
      type: Number,
      required: true,
      min: 1,
      description: "Unit number (e.g., 1, 2, 3, 4)",
    },
    lessonSection: {
      type: String,
      required: true,
      description:
        "Section within the unit (e.g., 'A', 'B', 'C', 'D', 'E', 'F', 'Ramp Ups', 'Unit Assessment')",
    },

    // =====================================
    // CONTENT
    // =====================================

    content: {
      type: String,
      required: true,
      default: "",
      description: "Markdown-formatted learning objectives content",
    },

    // =====================================
    // METADATA
    // =====================================

    active: {
      type: Boolean,
      default: true,
      description: "Whether this learning content is active",
    },
    notes: {
      type: String,
      required: false,
      description: "Optional notes about this content",
    },

    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "learning-content",
  },
);

// Compound index for unique lookups
learningContentSchema.index(
  { scopeSequenceTag: 1, grade: 1, unit: 1, lessonSection: 1 },
  { unique: true },
);

// Additional indexes for common queries
learningContentSchema.index({ scopeSequenceTag: 1, grade: 1 });
learningContentSchema.index({ unit: 1, lessonSection: 1 });

export const LearningContentModel =
  mongoose.models.LearningContent ||
  mongoose.model("LearningContent", learningContentSchema);
