import { z } from 'zod';

// School Schema
export const SchoolZodSchema = z.object({
  _id: z.string().optional(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  emoji: z.string().optional(),
  gradeLevelsSupported: z.array(z.string()),
  staffList: z.array(z.string()).optional(),
  schedules: z.array(z.string()).optional(),
  cycles: z.array(z.string()).optional(),
  owners: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolInput = Omit<School, '_id' | 'createdAt' | 'updatedAt'>;

// NYCPS Staff Schema
export const NYCPSStaffZodSchema = z.object({
  _id: z.string().optional(),
  staffName: z.string(),
  email: z.string().email().optional(),
  schools: z.array(z.string()),
  gradeLevelsSupported: z.array(z.string()),
  subjects: z.array(z.string()),
  specialGroups: z.array(z.string()),
  rolesNYCPS: z.array(z.string()).optional(),
  pronunciation: z.string().optional(),
  notes: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  owners: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type NYCPSStaffInput = Omit<NYCPSStaff, '_id' | 'createdAt' | 'updatedAt'>;

// Teaching Lab Staff Schema
export const TeachingLabStaffZodSchema = z.object({
  _id: z.string().optional(),
  staffName: z.string(),
  email: z.string().email(),
  schools: z.array(z.string()),
  adminLevel: z.string(),
  assignedDistricts: z.array(z.string()),
  rolesTL: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;
export type TeachingLabStaffInput = Omit<TeachingLabStaff, '_id' | 'createdAt' | 'updatedAt'>;

// Look For Schema
export const LookForZodSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  rubric: z.string().optional(),
  nextSteps: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForInput = Omit<LookFor, '_id' | 'createdAt' | 'updatedAt'>;
export type LookForItem = LookFor;

// Rubric Schema
export const RubricZodSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  lookFors: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Rubric = z.infer<typeof RubricZodSchema>;

// Next Step Schema
export const NextStepZodSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  lookFors: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type NextStep = z.infer<typeof NextStepZodSchema>; 