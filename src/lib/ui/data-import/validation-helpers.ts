import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import type { SchoolInput } from '@domain-types/school';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';

export type ImportDataType = 'school' | 'staff' | 'visits';

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate school data using Zod schema
 */
export function validateSchoolData(jsonString: string): ValidationResult<SchoolInput> {
  try {
    const parsed = JSON.parse(jsonString);
    console.log('📋 Parsed AI data:', JSON.stringify(parsed, null, 2));
    
    // Add missing required fields with defaults BEFORE validation
    const schoolDataWithDefaults = {
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
      // Override with AI data
      ...parsed
    };
    
    console.log('✅ Data with defaults applied:', JSON.stringify(schoolDataWithDefaults, null, 2));
    
    const validated = SchoolInputZodSchema.parse(schoolDataWithDefaults);
    console.log('🎯 Successfully validated school data');
    
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
}

/**
 * Validate staff data using Zod schema
 */
export function validateStaffData(jsonString: string): ValidationResult<NYCPSStaffInput[]> {
  try {
    const parsed = JSON.parse(jsonString);
    const staffArray = Array.isArray(parsed) ? parsed : [parsed];
    const validated = staffArray.map(staff => NYCPSStaffInputZodSchema.parse(staff));
    
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid staff data format'
    };
  }
}

/**
 * Validate visit data using Zod schema
 */
export function validateVisitData(jsonString: string): ValidationResult<VisitInput[]> {
  try {
    const parsed = JSON.parse(jsonString);
    const visitArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // Add defaults for required fields
    const visitsWithDefaults = visitArray.map(visit => ({
      events: [],
      sessionLinks: [],
      owners: [],
      gradeLevelsSupported: [],
      ...visit
    }));
    
    const validated = visitsWithDefaults.map(visit => VisitInputZodSchema.parse(visit));
    
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid visit data format'
    };
  }
}

/**
 * Enhanced validation for import data
 */
export function validateImportData(
  jsonString: string, 
  type: ImportDataType
): ValidationResult<SchoolInput | NYCPSStaffInput[] | VisitInput[]> {
  if (type === 'school') {
    return validateSchoolData(jsonString);
  } else if (type === 'staff') {
    return validateStaffData(jsonString);
  } else if (type === 'visits') {
    return validateVisitData(jsonString);
  }
  
  return { success: false, error: 'Unknown import type' };
}

/**
 * Validate server response with proper typing
 */
export function validateServerResponse<T>(response: unknown): ValidationResult<T[]> {
  try {
    if (typeof response === 'object' && response !== null && 'success' in response) {
      const typedResponse = response as { success: boolean; items?: T[]; error?: string };
      
      if (typedResponse.success && typedResponse.items) {
        return {
          success: true,
          data: typedResponse.items
        };
      } else {
        return {
          success: false,
          error: typedResponse.error || 'Server operation failed'
        };
      }
    }
    
    return {
      success: false,
      error: 'Invalid server response format'
    };
  } catch {
    return {
      success: false,
      error: 'Unknown server error'
    };
  }
}

/**
 * Create data preview for display
 */
export function createDataPreview(data: SchoolInput | NYCPSStaffInput[] | VisitInput[], type: 'school' | 'staff' | 'visits'): string {
  try {
    if (type === 'school') {
      const school = data as SchoolInput;
      return JSON.stringify({
        schoolName: school.schoolName,
        district: school.district,
        schoolNumber: school.schoolNumber,
        gradeLevelsSupported: school.gradeLevelsSupported,
        address: school.address
      }, null, 2);
    } else if (type === 'staff') {
      const staff = data as NYCPSStaffInput[];
      return JSON.stringify(staff.slice(0, 3).map(s => ({
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        role: s.role
      })), null, 2) + (staff.length > 3 ? `\n... and ${staff.length - 3} more` : '');
    } else if (type === 'visits') {
      const visits = data as VisitInput[];
      return JSON.stringify(visits.slice(0, 3).map(v => ({
        date: v.date,
        coach: v.coach,
        cycleRef: v.cycleRef,
        gradeLevelsSupported: v.gradeLevelsSupported
      })), null, 2) + (visits.length > 3 ? `\n... and ${visits.length - 3} more` : '');
    }
  } catch {
    return 'Error creating preview';
  }
  
  return 'Error creating preview';
} 