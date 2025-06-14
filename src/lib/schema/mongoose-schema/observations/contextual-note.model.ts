import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const contextualNoteFields = {
  content: { type: String, required: true },
  noteType: { type: String, enum: ['observation', 'debrief', 'reflection', 'action_item', 'quote', 'question', 'insight', 'concern', 'celebration'], required: true },
  tagging: { type: Object, required: true },
  visitId: { type: String },
  coachingActionPlanId: { type: String },
  classroomObservationId: { type: String },
  isPrivate: { type: Boolean, default: false },
  followUpRequired: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  ...standardDocumentFields
};

const ContextualNoteSchema = new mongoose.Schema(contextualNoteFields, {
  ...standardSchemaOptions,
  collection: 'contextualnotes'
});

export const ContextualNoteModel = mongoose.models.ContextualNote || 
  mongoose.model("ContextualNote", ContextualNoteSchema);

export async function getContextualNoteModel() {
  return ContextualNoteModel;
} 