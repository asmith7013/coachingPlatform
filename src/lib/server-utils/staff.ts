import { Model, Document } from "mongoose";
import { z } from "zod";
import { StaffMemberZodSchema, NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from "@/lib/zod-schema/core/staff";
import { StaffMemberModel, NYCPSStaffModel, TeachingLabStaffModel } from "@/models/core/staff.model";

export type StaffType = "all" | "nycps" | "tl";

export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;

// Base staff document type
export type StaffDocument = Document & {
  _id: string;
  id: string;
  staffName: string;
  email?: string;
  schools: string[];
  owners: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

// Specific staff document types
export type StaffMemberDocument = StaffDocument & StaffMember;
export type NYCPSStaffDocument = StaffDocument & NYCPSStaff;
export type TeachingLabStaffDocument = StaffDocument & TeachingLabStaff;

// Union type for all staff documents
export type StaffUnion = StaffMemberDocument | NYCPSStaffDocument | TeachingLabStaffDocument;

export interface StaffModelAndSchema<T extends StaffDocument> {
  model: Model<T>;
  schema: z.ZodType<T>;
}

export function getStaffModelAndSchema(type: StaffType): {
  model: Model<StaffUnion>;
  schema: z.ZodType<StaffUnion>;
} {
  switch (type) {
    case "nycps":
      return {
        model: NYCPSStaffModel as unknown as Model<StaffUnion>,
        schema: NYCPSStaffZodSchema as unknown as z.ZodType<StaffUnion>
      };
    case "tl":
      return {
        model: TeachingLabStaffModel as unknown as Model<StaffUnion>,
        schema: TeachingLabStaffZodSchema as unknown as z.ZodType<StaffUnion>
      };
    default:
      return {
        model: StaffMemberModel as unknown as Model<StaffUnion>,
        schema: StaffMemberZodSchema as unknown as z.ZodType<StaffUnion>
      };
  }
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