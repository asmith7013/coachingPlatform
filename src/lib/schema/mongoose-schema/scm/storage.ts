// src/lib/schema/mongoose-schema/integrations/snorkl.model.ts
import mongoose from "mongoose";
import { standardSchemaOptions } from "../shared-options";

// Student Response Schema (embedded)
const SnorklStudentResponseSchema = new mongoose.Schema(
  {
    correct: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    explanationScore: {
      type: Number,
      min: 0,
      max: 4,
      required: true,
    },
    responseDate: {
      type: String,
      required: true,
    },
  },
  { _id: false },
); // No _id for embedded docs

// Student Data Schema (embedded)
const SnorklStudentDataSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    bestResponseCorrect: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    bestResponseExplanationScore: {
      type: Number,
      min: 0,
      max: 4,
      required: true,
    },
    bestResponseDate: {
      type: String,
      required: true,
    },
    responses: [SnorklStudentResponseSchema],
  },
  { _id: false },
); // No _id for embedded docs

// Main Snorkl Activity Schema
const SnorklActivitySchemaFields = {
  activityTitle: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  teacher: {
    type: String,
    required: true,
  },
  activityId: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate activities
    index: true, // Index for faster queries
  },
  csvUrl: {
    type: String,
    required: true,
  },
  data: [SnorklStudentDataSchema],
  owners: [
    {
      type: String,
      required: true,
    },
  ],
};

const SnorklActivitySchema = new mongoose.Schema(SnorklActivitySchemaFields, {
  ...standardSchemaOptions,
  collection: "snorkl_activities",
});

// Indexes for better query performance
SnorklActivitySchema.index({ district: 1, section: 1 });
SnorklActivitySchema.index({ teacher: 1 });
SnorklActivitySchema.index({ activityId: 1 }, { unique: true });

// Scraping Metadata Schema
const SnorklScrapingMetadataSchemaFields = {
  scrapingDate: {
    type: String,
    required: true,
  },
  totalClassesScraped: {
    type: Number,
    required: true,
  },
  totalActivitiesFound: {
    type: Number,
    required: true,
  },
  totalErrorsEncountered: {
    type: Number,
    required: true,
  },
  classesProcessed: [
    {
      className: { type: String, required: true },
      classId: { type: String, required: true },
      activitiesFound: { type: Number, required: true },
      errors: [String],
    },
  ],
  globalErrors: [String],
  csvUrlsGenerated: [String],
};

const SnorklScrapingMetadataSchema = new mongoose.Schema(
  SnorklScrapingMetadataSchemaFields,
  {
    ...standardSchemaOptions,
    collection: "snorkl_scraping_metadata",
  },
);

// Create and export models
export const SnorklActivityModel =
  mongoose.models.SnorklActivity ||
  mongoose.model("SnorklActivity", SnorklActivitySchema);

export const SnorklScrapingMetadataModel =
  mongoose.models.SnorklScrapingMetadata ||
  mongoose.model("SnorklScrapingMetadata", SnorklScrapingMetadataSchema);
