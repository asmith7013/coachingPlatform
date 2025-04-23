import { z } from 'zod';

// Grade levels supported enum values
const GradeLevelsList = [
  'Grade K',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
] as const;

// Create the enum
export const GradeLevelsSupportedZod = z.enum(GradeLevelsList);
// Create a typed options array
export const GradeLevelsSupportedOptions = GradeLevelsList;

// Subjects enum values
const SubjectsList = [
  'Math K-5',
  'Math 6',
  'Math 7',
  'Math 8',
  'HS Algebra 1',
  'HS Geometry',
  'HS Algebra 2',
  'ELA',
  'Science',
  'Social Studies',
  'Other',
] as const;

// Create the enum
export const SubjectsZod = z.enum(SubjectsList);
// Create a typed options array
export const SubjectsOptions = SubjectsList;

// Special groups enum values
const SpecialGroupsList = [
  'ELL',
  'SPED',
  'G&T',
  'Other',
] as const;

// Create the enum
export const SpecialGroupsZod = z.enum(SpecialGroupsList);
// Create a typed options array
export const SpecialGroupsOptions = SpecialGroupsList;

// NYCPS Roles enum values
const RolesNYCPSList = [
  'Teacher',
  'Coach',
  'Assistant Principal',
  'Principal',
  'Administrator',
  'Other',
] as const;

// Create the enum
export const RolesNYCPSZod = z.enum(RolesNYCPSList);
// Create a typed options array
export const RolesNYCPSOptions = RolesNYCPSList; 