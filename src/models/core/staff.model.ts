import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedRolesNYCPSEnum,
  AllowedRolesTLEnum,
} from "../shared";
import {
  AllowedSubjectsEnum,
  AllowedSpecialGroupsEnum,
  TLAdminTypeEnum,
  AllowedGradeEnum,
} from "../shared/shared-types.model";

@modelOptions({ schemaOptions: { timestamps: true } })
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
  @prop({ type: mongoose.Types.ObjectId, required: true })
  _id!: mongoose.Types.ObjectId;

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
  @prop({ type: () => [String], required: true, enum: AllowedGradeEnum })
  gradeLevelsSupported!: string[];
  @prop({ type: () => [String], required: true, enum: AllowedSubjectsEnum })
  subjects!: string[];
  @prop({ type: () => [String], required: true, enum: AllowedSpecialGroupsEnum })
  specialGroups!: string[];
  @prop({ type: () => [String], enum: AllowedRolesNYCPSEnum })
  rolesNYCPS?: AllowedRolesNYCPSEnum[];
  @prop({ type: String })
  pronunciation?: string;
  @prop({ type: () => [Note], default: [] })
  notes?: Note[];
  @prop({ type: () => [Experience], default: [] })
  experience?: Experience[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, required: true, enum: TLAdminTypeEnum })
  adminLevel!: string;
  @prop({ type: () => [String], required: true })
  assignedDistricts!: string[];
  @prop({ type: () => [String], enum: AllowedRolesTLEnum })
  rolesTL?: AllowedRolesTLEnum[];
}

export const StaffMemberModel =
  mongoose.models.StaffMember || getModelForClass(StaffMember);

export const NYCPSStaffModel =
  mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);

export const TeachingLabStaffModel =
  mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);

export const ExperienceModel =
  mongoose.models.Experience || getModelForClass(Experience);