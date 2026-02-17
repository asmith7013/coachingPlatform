import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const rubricFields = {
  score: { type: Number, required: true },
  category: [{ type: String, required: true }],
  content: [{ type: String }],
  parentId: { type: String },
  collectionId: { type: String },
  hex: { type: String },
  ...standardDocumentFields,
};

const RubricSchema = new mongoose.Schema(rubricFields, {
  ...standardSchemaOptions,
  collection: "rubrics",
});

const rubricScoreFields = {
  date: { type: Date, required: true },
  score: { type: Number, required: true },
  staffId: { type: String, required: true },
  schoolId: { type: String, required: true },
  ...standardDocumentFields,
};

const RubricScoreSchema = new mongoose.Schema(rubricScoreFields, {
  ...standardSchemaOptions,
  collection: "rubricscores",
});

export const RubricModel =
  mongoose.models.Rubric || mongoose.model("Rubric", RubricSchema);

export const RubricScoreModel =
  mongoose.models.RubricScore ||
  mongoose.model("RubricScore", RubricScoreSchema);

export async function getRubricModel() {
  return RubricModel;
}

export async function getRubricScoreModel() {
  return RubricScoreModel;
}
