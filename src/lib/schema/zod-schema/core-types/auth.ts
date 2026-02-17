import { z } from "zod";
import { zDateField } from "@zod-schema/shared/dateHelpers";

// Staff type enum (building block)
export const StaffTypeSchema = z.enum(["nycps", "teachinglab"]);

// User metadata schema with proper validation
export const UserMetadataZodSchema = z.object({
  // Identity
  staffId: z.string().optional().describe("Associated staff member ID"),
  staffType: StaffTypeSchema.optional().describe("Type of staff member"),

  // Roles and permissions (arrays of strings with defaults)
  roles: z.array(z.string()).default([]).describe("User roles"),
  permissions: z.array(z.string()).default([]).describe("User permissions"),

  // Organization
  schoolId: z.string().optional().describe("Primary school ID"),
  schoolIds: z
    .array(z.string())
    .default([])
    .describe("All associated school IDs"),
  districtId: z.string().optional().describe("District ID"),
  organizationId: z.string().optional().describe("Organization ID"),

  // Additional metadata
  title: z.string().optional().describe("Job title"),
  department: z.string().optional().describe("Department"),
  managedSchools: z
    .array(z.string())
    .default([])
    .describe("Schools this user manages"),
  onboardingCompleted: z
    .boolean()
    .default(false)
    .describe("Whether onboarding is complete"),
  lastLoginAt: zDateField.optional().describe("Last login timestamp"),
});

// Error context schema for auth operations
export const ErrorContextBaseZodSchema = z.object({
  component: z.string().optional(),
  operation: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Base authenticated user data schema (without methods)
export const AuthenticatedUserBaseZodSchema = z.object({
  // Identity
  id: z.string().nullable().describe("User ID"),
  email: z.string().email().nullable().describe("User email"),
  fullName: z.string().nullable().describe("Full display name"),
  firstName: z.string().nullable().describe("First name"),
  lastName: z.string().nullable().describe("Last name"),
  imageUrl: z.string().url().nullable().describe("Profile image URL"),

  // Auth state
  isLoading: z.boolean().describe("Whether auth data is loading"),
  isSignedIn: z.boolean().describe("Whether user is signed in"),

  // Metadata
  metadata: UserMetadataZodSchema.describe("User metadata"),

  // Computed permissions
  permissions: z.array(z.string()).describe("Computed user permissions"),
});
