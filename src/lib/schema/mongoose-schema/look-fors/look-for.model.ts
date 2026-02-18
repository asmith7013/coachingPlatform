import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const lookForFields = {
  lookForIndex: { type: Number, required: true },
  schoolIds: [{ type: String, required: true }],
  teacherIds: [{ type: String, required: true }],
  topic: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  status: { type: String },
  studentFacing: { type: Boolean, required: true },
  rubricIds: [{ type: String }],
  ...standardDocumentFields,
};

const LookForSchema = new mongoose.Schema(lookForFields, {
  ...standardSchemaOptions,
  collection: "lookfors",
});

const lookForItemFields = {
  originalLookFor: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String, required: true }],
  lookForIndex: { type: Number, required: true },
  teacherIDs: [{ type: String, required: true }],
  chosenBy: [{ type: String, required: true }],
  active: { type: Boolean, required: true },
  ...standardDocumentFields,
};

const LookForItemSchema = new mongoose.Schema(lookForItemFields, {
  ...standardSchemaOptions,
  collection: "lookforitems",
});

export const LookForModel =
  mongoose.models.LookFor || mongoose.model("LookFor", LookForSchema);

export const LookForItemModel =
  mongoose.models.LookForItem ||
  mongoose.model("LookForItem", LookForItemSchema);

export async function getLookForModel() {
  return LookForModel;
}

export async function getLookForItemModel() {
  return LookForItemModel;
}
