// src/lib/schema/mongoose-schema/scm/roadmap-unit.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ROADMAP UNIT MODEL (Simplified to skill number references)
// =====================================
// Note: Skills are now stored separately in roadmap-skills collection
// Units only store arrays of skill numbers (strings)

const roadmapUnitFields = {
  // Metadata
  grade: { type: String, required: true, index: true },
  unitTitle: { type: String, required: true, index: true },
  unitNumber: { type: Number, required: false, index: true }, // Auto-extracted from unitTitle if not provided
  url: { type: String, required: true, index: true },

  // Counts (summary stats)
  targetCount: { type: Number, required: true },
  supportCount: { type: Number, required: true },
  extensionCount: { type: Number, required: true },

  // Skill references (arrays of skill numbers as strings)
  targetSkills: { type: [String], default: [] }, // e.g., ["265", "312", "45"]
  additionalSupportSkills: { type: [String], default: [] }, // e.g., ["123", "456"]
  extensionSkills: { type: [String], default: [] }, // e.g., ["789", "101"]

  // Metadata
  scrapedAt: { type: String, required: true, index: true },
  success: { type: Boolean, required: true, index: true },
  error: { type: String },

  ...standardDocumentFields
};

const RoadmapUnitSchema = new mongoose.Schema(roadmapUnitFields, {
  ...standardSchemaOptions,
  collection: 'roadmaps-units'
});

// Create compound index for unique constraint on grade + unitTitle
RoadmapUnitSchema.index({ grade: 1, unitTitle: 1 }, { unique: true });

export const RoadmapUnitModel = mongoose.models.RoadmapUnit ||
  mongoose.model('RoadmapUnit', RoadmapUnitSchema);
