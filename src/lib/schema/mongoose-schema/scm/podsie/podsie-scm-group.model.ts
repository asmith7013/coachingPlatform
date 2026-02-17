// src/lib/schema/mongoose-schema/scm/podsie/podsie-scm-group.model.ts
import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

// =====================================
// PODSIE SCM GROUP MODEL
// =====================================
// Stores basic metadata about a Podsie group (class section).
// Grade, school, and other group-level info that doesn't belong on the
// per-module pacing config (PodsieScmModuleModel).

// YouTube link subdocument schema
const youtubeLinkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false },
);

const podsieScmGroupFields = {
  // Unique identifier from Podsie
  podsieGroupId: { type: Number, required: true, unique: true, index: true },

  // Display name (synced from Podsie)
  groupName: { type: String },

  // Grade level for this section
  gradeLevel: { type: String, index: true }, // e.g., "6", "7", "8", "Algebra 1"

  // School name
  school: { type: String, index: true },

  // YouTube links for smartboard display
  youtubeLinks: { type: [youtubeLinkSchema], default: [] },

  ...standardDocumentFields,
};

const PodsieScmGroupSchema = new mongoose.Schema(podsieScmGroupFields, {
  ...standardSchemaOptions,
  collection: "podsie-scm-groups",
});

// Delete existing model to force schema refresh during development
if (mongoose.models.PodsieScmGroup) {
  delete mongoose.models.PodsieScmGroup;
}

export const PodsieScmGroupModel = mongoose.model(
  "PodsieScmGroup",
  PodsieScmGroupSchema,
);
