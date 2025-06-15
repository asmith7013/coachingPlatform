import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const noteFields = {
  date: { type: Date, required: true },
  type: { type: String, required: true },
  heading: { type: String, required: true },
  subheading: [{ type: String, required: true }],
  coachingActionPlanId: { type: String, required: false }, // Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE
  visitId: { type: String, required: false }, // Reference to Visit document _id if note is visit-specific
  ...standardDocumentFields
};

const NoteSchema = new mongoose.Schema(noteFields, {
  ...standardSchemaOptions,
  collection: 'notes'
});

export const NoteModel = mongoose.models.Note || 
  mongoose.model("Note", NoteSchema);

export async function getNoteModel() {
  return NoteModel;
}
