import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const cycleFields = {
  cycleNum: { type: Number, required: true },
  ipgIndicator: { type: String },
  actionPlanURL: { type: String },
  implementationIndicator: { type: String, required: true },
  supportCycle: { type: String },
  lookFors: [{ type: String, required: true }],
  ...standardDocumentFields,
};

const CycleSchema = new mongoose.Schema(cycleFields, {
  ...standardSchemaOptions,
  collection: "cycles",
});

export const CycleModel =
  mongoose.models.Cycle || mongoose.model("Cycle", CycleSchema);
