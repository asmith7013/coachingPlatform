import { Document, Types } from "mongoose";
import { z } from "zod";
import { StaffMemberZodSchema, NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from "@/lib/zod-schema/core/staff";
import { StaffMemberModel, NYCPSStaffModel, TeachingLabStaffModel } from "@/models/core/staff.model";

export type StaffType = "all" | "nycps" | "tl";

export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;

// Base staff document type
export type StaffDocument = Document & {
  _id: Types.ObjectId;
  id: string;
  staffName: string;
  email?: string;
  schools: string[];
  owners: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

// Specific staff document types
export type StaffMemberDocument = StaffDocument & StaffMember;
export type NYCPSStaffDocument = StaffDocument & NYCPSStaff;
export type TeachingLabStaffDocument = StaffDocument & TeachingLabStaff;

// Type-safe helpers for each staff type
export function getStaffMemberModelAndSchema() {
  return {
    model: StaffMemberModel,
    schema: StaffMemberZodSchema,
  } as const;
}

export function getNYCPSStaffModelAndSchema() {
  return {
    model: NYCPSStaffModel,
    schema: NYCPSStaffZodSchema,
  } as const;
}

export function getTeachingLabStaffModelAndSchema() {
  return {
    model: TeachingLabStaffModel,
    schema: TeachingLabStaffZodSchema,
  } as const;
}

export function determineStaffType(staff: unknown): StaffType {
  if (typeof staff !== "object" || staff === null) {
    return "all";
  }

  if ("gradeLevelsSupported" in staff) {
    return "nycps";
  }

  if ("adminLevel" in staff) {
    return "tl";
  }

  return "all";
}