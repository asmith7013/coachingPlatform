// src/lib/schema/mongoose-schema/scm/podsie/podsie-assignment.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// PODSIE ASSIGNMENT MODEL
// =====================================
// Stores assignment metadata from Podsie for context in pacing editor.
// Synced via GitHub Action from Podsie database.

const podsieAssignmentFields = {
  // Unique identifier from Podsie
  podsieAssignmentId: { type: Number, required: true, unique: true, index: true },

  // Assignment metadata
  title: { type: String, required: true },

  // Module association (null if not assigned to a module)
  podsieModuleId: { type: Number, index: true },

  // Order within module (null if no specific order)
  moduleOrder: { type: Number },

  // Assignment state in Podsie (draft, active, archived)
  state: { type: String },

  ...standardDocumentFields
};

const PodsieAssignmentSchema = new mongoose.Schema(podsieAssignmentFields, {
  ...standardSchemaOptions,
  collection: 'podsie-assignments'
});

// Index for querying by module
PodsieAssignmentSchema.index({ podsieModuleId: 1, moduleOrder: 1 });

// Delete existing model to force schema refresh during development
if (mongoose.models.PodsieAssignment) {
  delete mongoose.models.PodsieAssignment;
}

export const PodsieAssignmentModel = mongoose.model('PodsieAssignment', PodsieAssignmentSchema);
