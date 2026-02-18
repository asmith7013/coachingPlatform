import mongoose from "mongoose";
import {
  RolesNYCPS,
  RolesTL,
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

const baseStaffFields = {
  staffName: { type: String, required: true },
  email: { type: String },
  schoolIds: [{ type: String }],
  mondayUser: { type: MondayUserSchema },
  ...standardDocumentFields,
};

const nycpsStaffFields = {
  ...baseStaffFields,
  gradeLevelsSupported: [
    { type: String, required: true, enum: Object.values(GradeLevels) },
  ],
  subjects: [{ type: String, required: true, enum: Object.values(Subjects) }],
  specialGroups: [
    { type: String, required: true, enum: Object.values(SpecialGroups) },
  ],
  rolesNYCPS: [{ type: String, enum: Object.values(RolesNYCPS) }],
  pronunciation: { type: String },
  notes: [NoteSchema],
  experience: [ExperienceSchema],
};

const teachingLabStaffFields = {
  ...baseStaffFields,
  adminLevel: { type: String, enum: Object.values(AdminLevels) },
  assignedDistricts: [{ type: String }],
  rolesTL: [{ type: String, enum: Object.values(RolesTL) }],
};

const StaffMemberSchema = new mongoose.Schema(baseStaffFields, {
  ...standardSchemaOptions,
  collection: "staffmembers",
});
const NYCPSStaffSchema = new mongoose.Schema(nycpsStaffFields, {
  ...standardSchemaOptions,
  collection: "nycpsstaffs",
});
const TeachingLabStaffSchema = new mongoose.Schema(teachingLabStaffFields, {
  ...standardSchemaOptions,
  collection: "teachinglabstaffs",
});
const ExperienceModelSchema = new mongoose.Schema(ExperienceSchema, {
  ...standardSchemaOptions,
  collection: "experiences",
});
const NoteModelSchema = new mongoose.Schema(NoteSchema, {
  ...standardSchemaOptions,
  collection: "notes",
});

export const StaffMemberModel =
  mongoose.models.StaffMember ||
  mongoose.model("StaffMember", StaffMemberSchema);
export const NYCPSStaffModel =
  mongoose.models.NYCPSStaff || mongoose.model("NYCPSStaff", NYCPSStaffSchema);
export const TeachingLabStaffModel =
  mongoose.models.TeachingLabStaff ||
  mongoose.model("TeachingLabStaff", TeachingLabStaffSchema);
export const ExperienceModel =
  mongoose.models.Experience ||
  mongoose.model("Experience", ExperienceModelSchema);
export const NoteModel =
  mongoose.models.Note || mongoose.model("Note", NoteModelSchema);
