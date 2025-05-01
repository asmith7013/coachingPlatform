import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/data-server/db/connection";
import {
  RolesNYCPS,
  RolesTL,
  Subjects,
  SpecialGroups,
  AdminLevels,
  GradeLevels
} from "@enums";

// Add Monday.com User Class
@modelOptions({ schemaOptions: { timestamps: false, _id: false } })
class MondayUser {
  @prop({ type: String, required: true })
  mondayId!: string;
  
  @prop({ type: String, required: true })
  name!: string;
  
  @prop({ type: String, required: true })
  email!: string;
  
  @prop({ type: String })
  title?: string;
  
  // @prop({ type: () => [{ id: String, name: String }] })
  // teams?: { id: string; name: string }[];
  
  @prop({ type: Boolean })
  isVerified?: boolean;
  
  @prop({ type: Boolean, default: true })
  isConnected!: boolean;
  
  @prop({ type: String, default: new Date() })
  lastSynced?: string | Date;
}

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'experiences' } })
class Experience {
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true, min: 0 })
  years!: number;
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'notes' } })
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

@modelOptions({ schemaOptions: { timestamps: true, collection: 'staffmembers' } })
class StaffMember {
  @prop({ type: String, required: true })
  staffName!: string;
  @prop({ type: String })
  email!: string;
  @prop({ type: () => [String] })
  schools?: string[];
  @prop({ type: () => [String] })
  owners?: string[];
  @prop({ type: () => MondayUser })
  mondayUser?: MondayUser;
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'nycpsstaffs' } })
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

@modelOptions({ schemaOptions: { timestamps: true, collection: 'teachinglabstaffs' } })
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, enum: Object.values(AdminLevels) })
  adminLevel?: string;
  @prop({ type: () => [String]})
  assignedDistricts?: string[];
  @prop({ type: () => [String], enum: Object.values(RolesTL) })
  rolesTL?: string[];
}

// Add async model getters
export async function getStaffMemberModel() {
  await connectToDB();
  return mongoose.models.StaffMember || getModelForClass(StaffMember);
}

export async function getNYCPSStaffModel() {
  await connectToDB();
  return mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);
}

export async function getTeachingLabStaffModel() {
  await connectToDB();
  return mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);
}

export async function getExperienceModel() {
  await connectToDB();
  return mongoose.models.Experience || getModelForClass(Experience);
}

export async function getNoteModel() {
  await connectToDB();
  return mongoose.models.Note || getModelForClass(Note);
}

// Keep for backward compatibility
export const StaffMemberModel =
  mongoose.models.StaffMember || getModelForClass(StaffMember);

export const NYCPSStaffModel =
  mongoose.models.NYCPSStaff || getModelForClass(NYCPSStaff);

export const TeachingLabStaffModel =
  mongoose.models.TeachingLabStaff || getModelForClass(TeachingLabStaff);

export const ExperienceModel =
  mongoose.models.Experience || getModelForClass(Experience);
  
export const NoteModel =
  mongoose.models.Note || getModelForClass(Note);