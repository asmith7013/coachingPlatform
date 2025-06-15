import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const nextStepFields = {
  description: { type: String, required: true },
  lookForId: { type: String, required: true },
  teacherId: { type: String, required: true },
  schoolId: { type: String, required: true },
  coachingActionPlanId: { type: String, required: true },
  visitId: { type: String, required: false },
  ...standardDocumentFields
};

const NextStepSchema = new mongoose.Schema(nextStepFields, {
  ...standardSchemaOptions,
  collection: 'nextsteps'
});

export const NextStepModel = mongoose.models.NextStep || 
  mongoose.model("NextStep", NextStepSchema);

export async function getNextStepModel() {
  return NextStepModel;
}
  