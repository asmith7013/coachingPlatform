/**
 * UNIFIED Form Templates
 * 
 * Simple template generation and validation using transformer system
 */

import { validateSafe } from '@transformers/core/validation';
import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import type { SchoolInput } from '@domain-types/school';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';

/**
 * Schema templates for creating new entities
 */
export const schemaTemplates = {
  /**
   * Create a new school template
   */
  school: (): SchoolInput => ({
    schoolNumber: '',
    district: '',
    schoolName: '',
    address: '',
    emoji: '',
    gradeLevelsSupported: [],
    owners: []
  }),

  /**
   * Create a new NYCPS staff template
   */
  staff: (): NYCPSStaffInput => ({
    staffName: '',
    email: '',
    schools: [],
    owners: [],
    gradeLevelsSupported: [],
    subjects: [],
    specialGroups: [],
    rolesNYCPS: [],
    pronunciation: ''
  }),

  /**
   * Create a new visit template
   */
  visit: (): VisitInput => ({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    school: '',
    coach: '',
    gradeLevelsSupported: [],
    owners: []
  }),

  /**
   * Validate school data using transformer system
   */
  validateSchool: (data: unknown) => validateSafe(SchoolInputZodSchema, data),

  /**
   * Validate staff data using transformer system
   */
  validateStaff: (data: unknown) => validateSafe(NYCPSStaffInputZodSchema, data),

  /**
   * Validate visit data using transformer system
   */
  validateVisit: (data: unknown) => validateSafe(VisitInputZodSchema, data)
};

/**
 * Get template by entity type
 */
export function getTemplate(entityType: 'school' | 'staff' | 'visit'): Record<string, unknown> {
  switch (entityType) {
    case 'school':
      return schemaTemplates.school();
    case 'staff':
      return schemaTemplates.staff();
    case 'visit':
      return schemaTemplates.visit();
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

/**
 * Validate data by entity type
 */
export function validateTemplate(entityType: 'school' | 'staff' | 'visit', data: unknown): unknown | null {
  switch (entityType) {
    case 'school':
      return schemaTemplates.validateSchool(data);
    case 'staff':
      return schemaTemplates.validateStaff(data);
    case 'visit':
      return schemaTemplates.validateVisit(data);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
} 