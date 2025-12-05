import mongoose, { Schema, Model } from 'mongoose';
import type { PodsieQuestionMapDocument } from '@zod-schema/313/podsie/podsie-question-map';

// =====================================
// PODSIE QUESTION MAP MONGOOSE SCHEMA
// =====================================

const PodsieQuestionMapItemSchema = new Schema({
  questionNumber: { type: Number, required: true },
  questionId: { type: String, required: true },
  isRoot: { type: Boolean, required: true, default: true },
  rootQuestionId: { type: String, required: false },
  variantNumber: { type: Number, required: false },
}, { _id: false });

const PodsieQuestionMapSchema = new Schema<PodsieQuestionMapDocument>({
  assignmentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  assignmentName: {
    type: String,
    required: true,
  },
  questionMap: {
    type: [PodsieQuestionMapItemSchema],
    required: true,
    default: [],
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
  collection: 'podsie-question-maps',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// =====================================
// MODEL EXPORT
// =====================================

export const PodsieQuestionMapModel: Model<PodsieQuestionMapDocument> =
  mongoose.models['PodsieQuestionMap'] ||
  mongoose.model<PodsieQuestionMapDocument>('PodsieQuestionMap', PodsieQuestionMapSchema);
