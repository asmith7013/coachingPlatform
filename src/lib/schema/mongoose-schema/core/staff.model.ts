import mongoose from "mongoose";
import {
  Roles,
  Subjects,
  SpecialGroups,
  AdminLevels,
  GradeLevels,
} from "@enums";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const MondayUserSchema = new mongoose.Schema(
  {
    mondayId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String },
    isVerified: { type: Boolean },
    isConnected: { type: Boolean, default: true },
    lastSynced: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ExperienceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    years: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const NoteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, required: true },
    heading: { type: String, required: true },
    subheading: [{ type: String, required: true }],
  },
  { _id: false },
);

// Unified staff schema — superset of all previous staff types
const staffFields = {
  // Core fields
  staffName: { type: String, required: true },
  email: { type: String },
  schoolIds: [{ type: String }],
  mondayUser: { type: MondayUserSchema },
  roles: [{ type: String, enum: Object.values(Roles) }],

  // Teacher-specific fields
  gradeLevelsSupported: [{ type: String, enum: Object.values(GradeLevels) }],
  subjects: [{ type: String, enum: Object.values(Subjects) }],
  specialGroups: [{ type: String, enum: Object.values(SpecialGroups) }],
  pronunciation: { type: String },
  notes: [NoteSchema],
  experience: [ExperienceSchema],

  // Admin/TL-specific fields
  adminLevel: { type: String, enum: Object.values(AdminLevels) },
  assignedDistricts: [{ type: String }],

  ...standardDocumentFields,
};

const StaffSchema = new mongoose.Schema(staffFields, {
  ...standardSchemaOptions,
  collection: "staff",
});

const ExperienceModelSchema = new mongoose.Schema(ExperienceSchema, {
  ...standardSchemaOptions,
  collection: "experiences",
});
const NoteModelSchema = new mongoose.Schema(NoteSchema, {
  ...standardSchemaOptions,
  collection: "notes",
});

export const StaffModel =
  mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

export const ExperienceModel =
  mongoose.models.Experience ||
  mongoose.model("Experience", ExperienceModelSchema);
export const NoteModel =
  mongoose.models.Note || mongoose.model("Note", NoteModelSchema);
