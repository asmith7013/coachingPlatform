import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ACTIVITY TYPE CONFIG MODEL
// =====================================

const activityTypeConfigSchemaFields = {
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  label: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  requiresDetails: {
    type: Boolean,
    required: true
  },
  detailType: {
    type: String,
    required: true,
    enum: ['inquiry', 'lesson', 'skill', 'custom', 'none']
  },
  icon: {
    type: String,
    required: true,
    maxlength: 10
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-Fa-f]{6}$/
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    index: true
  },
  ...standardDocumentFields
};

const ActivityTypeConfigSchema = new mongoose.Schema(
  activityTypeConfigSchemaFields,
  {
    ...standardSchemaOptions,
    collection: 'activity-type-configs'
  }
);

// Indexes for common queries
ActivityTypeConfigSchema.index({ order: 1 });
ActivityTypeConfigSchema.index({ isDefault: 1 });

export const ActivityTypeConfigModel = mongoose.models.ActivityTypeConfig ||
  mongoose.model("ActivityTypeConfig", ActivityTypeConfigSchema);
