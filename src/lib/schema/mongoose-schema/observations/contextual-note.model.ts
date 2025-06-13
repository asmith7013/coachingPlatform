import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

@modelOptions({ 
  schemaOptions: { 
    collection: 'contextualnotes' 
  } 
})
export class ContextualNote extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  content!: string;
  
  @prop({ type: String, enum: ['observation', 'debrief', 'reflection', 'action_item', 'quote', 'question', 'insight', 'concern', 'celebration'], required: true })
  noteType!: string;
  
  @prop({ type: Object, required: true })
  tagging!: object;
  
  @prop({ type: String })
  visitId?: string;
  
  @prop({ type: String })
  coachingActionPlanId?: string;
  
  @prop({ type: String })
  classroomObservationId?: string;
  
  @prop({ type: Boolean, default: false })
  isPrivate!: boolean;
  
  @prop({ type: Boolean, default: false })
  followUpRequired!: boolean;
  
  @prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: string;
}

export const ContextualNoteModel =
  mongoose.models.ContextualNote || getModelForClass(ContextualNote, { schemaOptions: { collection: 'contextualnotes' } });

export async function getContextualNoteModel() {
  return getModel<ContextualNote>('ContextualNote', () => getModelForClass(ContextualNote));
} 