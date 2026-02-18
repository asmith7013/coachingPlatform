// src/lib/schema/mongoose-schema/scm/podsie/worked-example-request.model.ts
import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@schema/enum/scm";

// =====================================
// WORKED EXAMPLE REQUEST MODEL
// =====================================

/**
 * Worked Example Request - Teacher submission for creating a new worked example
 *
 * Teachers identify what lesson/skills students are struggling with,
 * upload a practice problem image, and submit to a queue for manual
 * processing via Claude Code.
 */

const workedExampleRequestSchema = new mongoose.Schema(
  {
    // =====================================
    // STATUS
    // =====================================
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
      required: true,
      description: "Current status of the request",
    },

    // =====================================
    // LESSON REFERENCE (from scope-and-sequence selection)
    // =====================================
    scopeSequenceTag: {
      type: String,
      required: true,
      enum: SCOPE_SEQUENCE_TAG_OPTIONS,
      description: "Curriculum tag (Grade 6, Grade 7, Grade 8, Algebra 1)",
    },
    grade: {
      type: String,
      required: true,
      description: "Grade level string",
    },
    unitNumber: {
      type: Number,
      required: true,
      min: 1,
      description: "Unit number",
    },
    lessonNumber: {
      type: Number,
      required: true,
      description: "Lesson number (can be 0 or negative for ramp-ups)",
    },
    lessonName: {
      type: String,
      required: true,
      description: "Full lesson name",
    },
    scopeAndSequenceId: {
      type: String,
      required: true,
      description: "MongoDB ObjectId reference to scope-and-sequence document",
    },
    section: {
      type: String,
      enum: ["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"],
      required: false,
      description: "Lesson section within the unit",
    },

    // =====================================
    // ROADMAP SKILLS CONTEXT
    // =====================================
    roadmapSkills: {
      type: [String],
      default: [],
      description: "All roadmap skill numbers from the lesson",
    },
    targetSkills: {
      type: [String],
      default: [],
      description: "Target skill numbers from the lesson",
    },

    // =====================================
    // TEACHER INPUT: WHAT STUDENT IS STRUGGLING WITH
    // =====================================
    strugglingSkillNumbers: {
      type: [String],
      required: true,
      description: "Which skills teacher thinks student struggles with",
    },
    strugglingDescription: {
      type: String,
      required: true,
      minLength: 10,
      description: "Free text: describe the misconception/struggle",
    },

    // =====================================
    // WORKED EXAMPLE CONTENT FIELDS
    // =====================================
    title: {
      type: String,
      required: false,
      description: "Optional title - can auto-generate",
    },
    mathConcept: {
      type: String,
      required: true,
      description: "The math concept being taught",
    },
    mathStandard: {
      type: String,
      required: true,
      description: "Math standard (e.g., 8.EE.B.5)",
    },
    learningGoals: {
      type: [String],
      default: [],
      description: "Student-facing learning objectives",
    },

    // =====================================
    // SOURCE IMAGE (uploaded to Vercel Blob)
    // =====================================
    sourceImageUrl: {
      type: String,
      required: true,
      description: "Vercel Blob URL of uploaded practice problem image",
    },
    sourceImageFilename: {
      type: String,
      required: true,
      description: "Original filename of the uploaded image",
    },

    // =====================================
    // ADDITIONAL NOTES
    // =====================================
    additionalNotes: {
      type: String,
      required: false,
      description: "Additional context or notes from teacher",
    },

    // =====================================
    // METADATA
    // =====================================
    requestedBy: {
      type: String,
      required: true,
      description: "User ID who submitted the request",
    },
    requestedByEmail: {
      type: String,
      required: false,
      description: "Email for notifications",
    },
    completedWorkedExampleId: {
      type: String,
      required: false,
      description:
        "MongoDB ObjectId of created worked example deck when completed",
    },

    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "worked-example-requests",
  },
);

// Indexes
workedExampleRequestSchema.index({ status: 1, createdAt: -1 }); // For queue view (pending first, newest first)
workedExampleRequestSchema.index({
  scopeSequenceTag: 1,
  unitNumber: 1,
  lessonNumber: 1,
}); // For filtering by lesson
workedExampleRequestSchema.index({ requestedBy: 1 }); // For user's requests
workedExampleRequestSchema.index({ createdAt: -1 }); // For recent requests

export const WorkedExampleRequestModel =
  mongoose.models.WorkedExampleRequest ||
  mongoose.model("WorkedExampleRequest", workedExampleRequestSchema);
