import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedRolesNYCPSEnum,
  AllowedRolesTLEnum,
} from "../shared";


@modelOptions({ schemaOptions: { timestamps: true } })
class Experience {
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true })
  years!: number;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class StaffMember {
  @prop({ type: String })
  _id?: string;
  @prop({ type: String, required: true })
  id!: string;
  @prop({ type: String, required: true })
  staffName!: string;
  @prop({ type: String })
  email?: string;
  @prop({ type: () => [String], required: true })
  schools!: string[];
  @prop({ type: String })
  schedule?: string;
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

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
class NYCPSStaff extends StaffMember {
  @prop({ type: () => [String], required: true })
  gradeLevelsSupported!: string[];

  @prop({ type: () => [String], required: true })
  subjects!: string[];

  @prop({ type: () => [String], required: true })
  specialGroups!: string[];

  @prop({ type: () => Note, default: [] })
  notes?: Note[];

  @prop({ type: () => [String], enum: AllowedRolesNYCPSEnum })
  allowedRolesNYCPS?: AllowedRolesNYCPSEnum[];

  @prop({ type: String })
  pronunciation?: string;

  @prop({ type: String })
  schedule?: string;

  @prop({ type: () => [Experience], default: [] })
  experience?: Experience[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, required: true })
  adminLevel!: string;

  @prop({ type: () => [String], required: true })
  assignedDistricts!: string[];

  @prop({ type: () => [String], enum: AllowedRolesTLEnum })
  allowedRolesTL?: AllowedRolesTLEnum[];
}

export const StaffMemberModel =
  mongoose.models.StaffMember || getModelForClass(StaffMember);

export const NYCPSStaffModel =
  mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);

export const TeachingLabStaffModel =
  mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);

export const ExperienceModel =
  mongoose.models.Experience || getModelForClass(Experience);