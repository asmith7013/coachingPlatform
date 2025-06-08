import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  RolesNYCPS,
  RolesTL,
  Subjects,
  SpecialGroups,
  AdminLevels,
  GradeLevels
} from "@enums";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

// Add Monday.com User Class
@modelOptions({ 
  schemaOptions: { _id: false }, 
  options: { customName: 'MondayUser', automaticName: false } 
})
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
  
  @prop({ type: Date, default: new Date() })
  lastSynced?: Date;
}

@modelOptions({ schemaOptions: { _id: false, collection: 'experiences' } })
class Experience {
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true, min: 0 })
  years!: number;
}

@modelOptions({ 
  schemaOptions: { 
    collection: 'notes',
    // Handle ObjectId conversion at model level
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    },
    toObject: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    }
  } 
})
class Note extends BaseMongooseDocument {
  @prop({ type: Date, required: true })
  date!: Date;
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: String, required: true })
  heading!: string;
  @prop({ type: () => [String], required: true })
  subheading!: string[];
}

@modelOptions({ 
  schemaOptions: { 
    collection: 'staffmembers',
    // Handle ObjectId conversion at model level
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    },
    toObject: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    }
  } 
})
class StaffMember extends BaseMongooseDocument {
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

@modelOptions({ 
  schemaOptions: { 
    collection: 'nycpsstaffs',
    // Handle ObjectId conversion at model level
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    },
    toObject: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    }
  } 
})
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

@modelOptions({ 
  schemaOptions: { 
    collection: 'teachinglabstaffs',
    // Handle ObjectId conversion at model level
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    },
    toObject: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        return ret;
      }
    }
  } 
})
class TeachingLabStaff extends StaffMember {
  @prop({ type: String, enum: Object.values(AdminLevels) })
  adminLevel?: string;
  @prop({ type: () => [String]})
  assignedDistricts?: string[];
  @prop({ type: () => [String], enum: Object.values(RolesTL) })
  rolesTL?: string[];
}

// Add async model getters using the registry
export async function getStaffMemberModel() {
  return getModel<StaffMember>('StaffMember', () => getModelForClass(StaffMember));
}

export async function getNYCPSStaffModel() {
  return getModel<NYCPSStaff>('NYCPSStaff', () => getModelForClass(NYCPSStaff));
}

export async function getTeachingLabStaffModel() {
  return getModel<TeachingLabStaff>('TeachingLabStaff', () => getModelForClass(TeachingLabStaff));
}

export async function getExperienceModel() {
  return getModel<Experience>('Experience', () => getModelForClass(Experience));
}

export async function getNoteModel() {
  return getModel<Note>('Note', () => getModelForClass(Note));
}

export async function getMondayUserModel() {
  return getModel<MondayUser>('MondayUser', () => getModelForClass(MondayUser));
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