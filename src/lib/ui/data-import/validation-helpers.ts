import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
import type { SchoolInput } from '@domain-types/school';
import type { NYCPSStaffInput } from '@domain-types/staff';

export type ImportDataType = 'school' | 'staff';

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
    const validated = SchoolInputZodSchema.parse(parsed);
    
    return {
      success: true,
      data: validated
    };
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
 * Enhanced validation for import data
 */
export function validateImportData(
  jsonString: string, 
  type: ImportDataType
): ValidationResult<SchoolInput | NYCPSStaffInput[]> {
  if (type === 'school') {
    return validateSchoolData(jsonString);
  } else if (type === 'staff') {
    return validateStaffData(jsonString);
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
export function createDataPreview(data: SchoolInput | NYCPSStaffInput[], type: 'school' | 'staff'): string {
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
    } else {
      const staff = data as NYCPSStaffInput[];
      return JSON.stringify(staff.slice(0, 3).map(s => ({
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        role: s.role
      })), null, 2) + (staff.length > 3 ? `\n... and ${staff.length - 3} more` : '');
    }
  } catch {
    return 'Error creating preview';
  }
} 