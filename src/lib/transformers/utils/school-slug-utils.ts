/**
 * School Slug Transformation Utilities
 * 
 * Provides utilities for transforming school data between different representations:
 * - Object data ↔ URL slugs
 * - Object data ↔ Breadcrumb labels
 * - Slug parsing and validation
 */

/**
 * Creates a URL-safe slug from district and school number
 * 
 * @param district - School district name
 * @param schoolNumber - School number/identifier
 * @returns URL-safe slug in format "district-schoolnumber"
 * 
 * @example
 * createSchoolSlug("District 75", "K015") // "district75-k015"
 * createSchoolSlug("NYC DOE", "M123") // "nycdoe-m123"
 */
export function createSchoolSlug(district: string, schoolNumber: string): string {
  const normalizedDistrict = district.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedNumber = schoolNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${normalizedDistrict}-${normalizedNumber}`;
}

/**
 * Parses a school slug back into district and school number components
 * 
 * @param slug - URL slug to parse
 * @returns Object with district and schoolNumber, or null if invalid
 * 
 * @example
 * parseSchoolSlug("district75-k015") // { district: "DISTRICT75", schoolNumber: "K015" }
 * parseSchoolSlug("invalid") // null
 */
export function parseSchoolSlug(slug: string): { district: string; schoolNumber: string } | null {
  const match = slug.match(/^([a-z0-9]+)-(.+)$/);
  if (!match) return null;
  
  return {
    district: match[1].toUpperCase(),
    schoolNumber: match[2].toUpperCase()
  };
}

/**
 * Creates a human-readable breadcrumb label for a school
 * 
 * @param schoolNumber - School number/identifier
 * @param schoolName - Full school name
 * @returns Formatted breadcrumb label
 * 
 * @example
 * createSchoolBreadcrumbLabel("K015", "City Island School") // "K015: City Island School"
 */
export function createSchoolBreadcrumbLabel(schoolNumber: string, schoolName: string): string {
  return `${schoolNumber}: ${schoolName}`;
}

/**
 * Transforms a school object to a URL slug
 * 
 * @param school - School object with district and schoolNumber
 * @returns URL-safe slug
 * 
 * @example
 * schoolToSlug({ district: "District 75", schoolNumber: "K015" }) // "district75-k015"
 */
export function schoolToSlug(school: { district: string; schoolNumber: string }): string {
  return createSchoolSlug(school.district, school.schoolNumber);
}

/**
 * Transforms a school object to a breadcrumb label
 * 
 * @param school - School object with schoolNumber and schoolName
 * @returns Formatted breadcrumb label
 * 
 * @example
 * schoolToBreadcrumb({ schoolNumber: "K015", schoolName: "City Island School" }) // "K015: City Island School"
 */
export function schoolToBreadcrumb(school: { schoolNumber: string; schoolName: string }): string {
  return createSchoolBreadcrumbLabel(school.schoolNumber, school.schoolName);
}

/**
 * Validates if a string is a valid school slug format
 * 
 * @param slug - String to validate
 * @returns True if valid slug format
 * 
 * @example
 * isValidSchoolSlug("district75-k015") // true
 * isValidSchoolSlug("invalid-format-with-too-many-parts") // false
 */
export function isValidSchoolSlug(slug: string): boolean {
  return parseSchoolSlug(slug) !== null;
}

/**
 * Creates a school slug with validation
 * 
 * @param district - School district name
 * @param schoolNumber - School number/identifier
 * @returns URL-safe slug or throws error if invalid input
 * 
 * @throws Error if district or schoolNumber is empty
 */
export function createValidatedSchoolSlug(district: string, schoolNumber: string): string {
  if (!district?.trim()) {
    throw new Error('District is required for school slug creation');
  }
  if (!schoolNumber?.trim()) {
    throw new Error('School number is required for school slug creation');
  }
  
  return createSchoolSlug(district, schoolNumber);
}

/**
 * Type definitions for school slug transformations
 */
export interface SchoolSlugData {
  district: string;
  schoolNumber: string;
}

export interface SchoolBreadcrumbData {
  schoolNumber: string;
  schoolName: string;
}

export interface SchoolForSlug {
  district: string;
  schoolNumber: string;
}

export interface SchoolForBreadcrumb {
  schoolNumber: string;
  schoolName: string;
} 