import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { BellScheduleInputZodSchema, TeacherScheduleInputZodSchema } from '@zod-schema/schedule/schedule';
import type { SchoolInput } from '@domain-types/school';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';
import type { BellScheduleInput, TeacherScheduleInput } from '@zod-schema/schedule/schedule';

// Use consolidated validation approach
import { validateSafe } from '@transformers/core/validation';

export type ImportDataType = 'school' | 'staff' | 'visits' | 'bellSchedules' | 'masterSchedule';

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

interface ProcessedTeacherSchedule extends TeacherScheduleInput {
  teacherEmail: string;
  teacherName: string;
}

interface MasterScheduleData {
  teacherSchedules: Array<{
    teacherName: string;
    teacherEmail: string;
    scheduleByDay: TeacherScheduleInput['scheduleByDay'];
  }>;
}

/**
 * Apply entity-specific defaults before validation
 * This handles the domain-specific requirement to provide sensible defaults
 * for required fields that AI might not populate
 */
function applySchoolDefaults(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  
  return {
    // Required array fields with defaults
    staffList: [],
    schedules: [],
    cycles: [],
    owners: [],
    gradeLevelsSupported: [],
    // Required string fields
    schoolNumber: '',
    district: '',
    schoolName: '',
    // Optional fields
    address: '',
    emoji: '',
    // Override with provided data
    ...data
  };
}

function applyVisitDefaults(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  
  return {
    events: [],
    sessionLinks: [],
    owners: [],
    gradeLevelsSupported: [],
    ...data
  };
}

function applyBellScheduleDefaults(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  
  return {
    classSchedule: [],
    assignedCycleDays: [],
    owners: [],
    ...data
  };
}

/**
 * Validate school data using consolidated validateSafe approach
 */
export function validateSchoolData(jsonString: string): ValidationResult<SchoolInput> {
  try {
    const parsed = JSON.parse(jsonString);
    const withDefaults = applySchoolDefaults(parsed);
    const result = validateSafe(SchoolInputZodSchema, withDefaults);
    
    return result 
      ? { success: true, data: result }
      : { success: false, error: 'Schema validation failed' };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validate staff data using consolidated validateSafe approach
 */
export function validateStaffData(jsonString: string): ValidationResult<NYCPSStaffInput[]> {
  try {
    const parsed = JSON.parse(jsonString);
    const staffArray = Array.isArray(parsed) ? parsed : [parsed];
    
    const validatedItems = staffArray
      .map(item => validateSafe(NYCPSStaffInputZodSchema, item))
      .filter((item): item is NYCPSStaffInput => item !== null);
    
    return validatedItems.length > 0
      ? { success: true, data: validatedItems }
      : { success: false, error: 'Validation failed' };
  } catch {
    return { success: false, error: 'Invalid staff data format' };
  }
}

/**
 * Validate visit data using consolidated validateSafe approach
 */
export function validateVisitData(jsonString: string): ValidationResult<VisitInput[]> {
  try {
    const parsed = JSON.parse(jsonString);
    const visitArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // Apply defaults to each visit
    const visitsWithDefaults = visitArray.map(applyVisitDefaults);
    
    const validatedItems = visitsWithDefaults
      .map(item => validateSafe(VisitInputZodSchema, item))
      .filter((item): item is VisitInput => item !== null);
    
    return validatedItems.length > 0
      ? { success: true, data: validatedItems }
      : { success: false, error: 'Validation failed' };
  } catch {
    return { success: false, error: 'Invalid visit data format' };
  }
}

/**
 * Validate bell schedule data using consolidated validateSafe approach
 */
export function validateBellScheduleData(jsonString: string): ValidationResult<BellScheduleInput[]> {
  try {
    const parsed = JSON.parse(jsonString);
    const scheduleArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // Apply defaults to each bell schedule
    const schedulesWithDefaults = scheduleArray.map(applyBellScheduleDefaults);
    
    const validatedItems = schedulesWithDefaults
      .map(item => validateSafe(BellScheduleInputZodSchema, item))
      .filter((item): item is BellScheduleInput => item !== null);
    
    return validatedItems.length > 0
      ? { success: true, data: validatedItems }
      : { success: false, error: 'Validation failed' };
  } catch {
    return { success: false, error: 'Invalid bell schedule data format' };
  }
}

/**
 * Validate master schedule data using consolidated validateSafe approach
 */
export function validateMasterScheduleData(
  jsonString: string,
  schoolId?: string,
  availableStaff?: Array<{ staffName: string; email: string }>
): ValidationResult<ProcessedTeacherSchedule[]> {
  try {
    const parsed: MasterScheduleData = JSON.parse(jsonString);
    
    if (!parsed.teacherSchedules || !Array.isArray(parsed.teacherSchedules)) {
      return {
        success: false,
        error: 'Invalid format: expected object with "teacherSchedules" array'
      };
    }
    
    const validatedSchedules: ProcessedTeacherSchedule[] = [];
    const warnings: string[] = [];
    const availableEmails = availableStaff?.map(s => s.email.toLowerCase()) || [];
    
    for (const teacherSchedule of parsed.teacherSchedules) {
      // Validate email format
      if (!teacherSchedule.teacherEmail || !teacherSchedule.teacherEmail.includes('@')) {
        warnings.push(`Invalid email for teacher: ${teacherSchedule.teacherName || 'Unknown'}`);
        continue;
      }
      
      // Check if email exists in available staff (if provided)
      if (availableStaff && availableStaff.length > 0) {
        const emailMatch = availableEmails.includes(teacherSchedule.teacherEmail.toLowerCase());
        if (!emailMatch) {
          warnings.push(`Email ${teacherSchedule.teacherEmail} not found in school staff. Available emails: ${availableEmails.join(', ')}`);
          continue;
        }
      }
      
      // Create schedule object for validation
      const scheduleData = {
        teacher: "", // Will be filled after staff lookup
        school: schoolId || "",
        scheduleByDay: teacherSchedule.scheduleByDay,
        owners: [] // Will be filled later
      };
      
      // Validate against teacher schedule schema
      const result = validateSafe(TeacherScheduleInputZodSchema, scheduleData);
      if (!result) {
        warnings.push(`Schedule validation failed for ${teacherSchedule.teacherName}`);
        continue;
      }
      
      // Add to validated schedules with email info preserved
      validatedSchedules.push({
        ...result,
        teacherEmail: teacherSchedule.teacherEmail,
        teacherName: teacherSchedule.teacherName
      });
    }
    
    if (validatedSchedules.length === 0) {
      return {
        success: false,
        error: 'No valid teacher schedules found',
        warnings
      };
    }
    
    return { 
      success: true, 
      data: validatedSchedules,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
}

// /**
//  * Unified validation dispatcher
//  * Uses the consolidated validation approach
//  */
// export function validateImportData(
//   jsonString: string, 
//   type: ImportDataType
// ): ValidationResult<SchoolInput | NYCPSStaffInput[] | VisitInput[] | BellScheduleInput[]> {
//   switch (type) {
//     case 'school':
//       return validateSchoolData(jsonString);
//     case 'staff':
//       return validateStaffData(jsonString);
//     case 'visits':
//       return validateVisitData(jsonString);
//     case 'bellSchedules':
//       return validateBellScheduleData(jsonString);
//     default:
//       return { success: false, error: 'Unknown import type' };
//   }
// }
