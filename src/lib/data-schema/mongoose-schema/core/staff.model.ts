import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  RolesNYCPS,
  RolesTL,
  Subjects,
  SpecialGroups,
  AdminLevels,
  GradeLevels
} from "@data-schema/enum";

@modelOptions({ schemaOptions: { timestamps: true, _id: false } })
class Experience {
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true, min: 0 })
  years!: number;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class Note {
  @prop({ type: String, required: true })
  date!: string;
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: String, required: true })
  heading!: string;
  @prop({ type: () => [String], required: true })
  subheading!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class StaffMember {

  @prop({ type: String, required: true })
  staffName!: string;
  @prop({ type: String })
  email?: string;
  @prop({ type: () => [String], required: true })
  schools!: string[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class NYCPSStaff extends StaffMember {
  @prop({ type: () => [String], required: true, enum: Object.values(GradeLevels) })
  gradeLevelsSupported!: string[];
  @prop({ type: () => [String], required: true, enum: Object.values(Subjects) })
  subjects!: string[];
  @prop({ type: () => [String], required: true, enum: Object.values(SpecialGroups) })
  specialGroups!: string[];
  @prop({ type: () => [String], enum: Object.values(RolesNYCPS) })
  rolesNYCPS?: string[];
  @prop({ type: String })
  pronunciation?: string;
  @prop({ type: () => [Note], default: [] })
  notes?: Note[];
  @prop({ type: () => [Experience], default: [] })
  experience?: Experience[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, required: true, enum: Object.values(AdminLevels) })
  adminLevel!: string;
  @prop({ type: () => [String], required: true })
  assignedDistricts!: string[];
  @prop({ type: () => [String], enum: Object.values(RolesTL) })
  rolesTL?: string[];
}

export const StaffMemberModel =
  mongoose.models.StaffMember || getModelForClass(StaffMember);

export const NYCPSStaffModel =
  mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);

export const TeachingLabStaffModel =
  mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);

export const ExperienceModel =
  mongoose.models.Experience || getModelForClass(Experience);