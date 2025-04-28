/**
 * School domain types
 * Re-exports types from Zod schemas for centralized imports
 */

// Re-export types directly from the schema
export type {
    School,
    SchoolInput,
    SchoolClient
  } from '@zod-schema/core/school';
  
  // Additional domain-specific type utilities for school
  export interface SchoolFilterParams {
    district?: string;
    gradeLevelsSupported?: string[];
    search?: string;
  }
  
  /**
   * Helper to format school display names
   */
  export function formatSchoolDisplayName(school: { schoolNumber?: string; schoolName: string }): string {
    return school.schoolNumber ? `${school.schoolNumber} - ${school.schoolName}` : school.schoolName;
  }