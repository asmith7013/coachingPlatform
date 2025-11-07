import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// ACTIVITY TYPE CONFIG MODEL
// =====================================

const activityTypeConfigSchemaFields = {
  label: {
    type: String,
    required: true,
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
    required: true
  },
  ...standardDocumentFields
};

const ActivityTypeConfigSchema = new mongoose.Schema(
  activityTypeConfigSchemaFields,
  {
    ...standardSchemaOptions,
    collection: 'activity-type-configs',
    autoIndex: false, // Disable automatic index creation
    id: false, // Disable Mongoose's built-in id virtual getter
    _id: true // Keep MongoDB's _id field
  }
);

// Force delete cached model to ensure schema changes are applied
if (mongoose.models.ActivityTypeConfig) {
  delete mongoose.models.ActivityTypeConfig;
}

export const ActivityTypeConfigModel = mongoose.model("ActivityTypeConfig", ActivityTypeConfigSchema);
