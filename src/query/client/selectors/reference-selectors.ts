// src/query/client/selectors/reference-selectors.ts

import { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { EntitySelector } from "./selector-types";
import { getSelector } from "./selector-registry";
import { handleClientError } from "@error/handlers/client";
import { School } from "@zod-schema/core/school";
import { NYCPSStaff } from "@zod-schema/core/staff";
import { TeachingLabStaff } from "@zod-schema/core/staff";
import { Visit } from "@zod-schema/visits/visit";
import { CoachingLog } from "@zod-schema/visits/coaching-log";
import { LookFor } from "@zod-schema/look-fors/look-for";

// Base reference schema and type
export const BaseReferenceZodSchema = z.object({
  _id: z.string(),
  label: z.string(),
  value: z.string().optional(),
});

export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;

/**
 * Enhanced selector factory extension for references
 * Extends an existing selector with reference capabilities
 */
export function enhanceWithReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference
>(
  selector: EntitySelector<T>,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
): EntitySelector<T> & { 
  enhancedReference: (data: unknown) => R[] 
} {
  // Create reference transformation function
  const referenceTransformer = (items: T[]): R[] => {
    return items.map(item => {
      const reference: BaseReference = {
        _id: item._id,
        label: getLabelFn(item),
        value: item._id,
      };
      
      return {
        ...reference,
        ...(getAdditionalFields ? getAdditionalFields(item) : {}),
      } as R;
    });
  };
  
  // Create enhanced reference selector function
  const enhancedReference = (data: unknown): R[] => {
    try {
      // Use the existing basic selector to get the transformed items
      const items = selector.basic(data);
      // Apply the reference transformation
      return referenceTransformer(items);
    } catch (error) {
      handleClientError(error, 'enhancedReference');
      return [];
    }
  };
  
  // Return the enhanced selector
  return {
    ...selector,
    enhancedReference
  };
}

/**
 * Registers a reference selector for an entity type
 */
export function registerReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference
>(
  entityType: string,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
): (data: unknown) => R[] {
  // Get or create the selector for this entity type
  const selector = getSelector<T>(entityType);
  
  // Create the enhanced selector
  const enhanced = enhanceWithReferenceSelector<T, R>(
    selector,
    getLabelFn,
    getAdditionalFields
  );
  
  // Return the enhanced reference function
  return enhanced.enhancedReference;
}

// Define entity-specific reference interfaces
export interface SchoolReference extends BaseReference {
  schoolNumber?: string;
  district?: string;
}

export interface StaffReference extends BaseReference {
  email?: string;
  role?: string;
}

export interface ScheduleReference extends BaseReference {
  teacher?: string;
  school?: string;
}

export interface BellScheduleReference extends BaseReference {
  school?: string;
  bellScheduleType?: string;
}

export interface LookForReference extends BaseReference {
  lookForIndex?: number;
}

export interface VisitReference extends BaseReference {
  date?: string;
  school?: string;
}

export interface CoachingLogReference extends BaseReference {
  solvesTouchpoint?: string;
}

// Pre-configure common reference transformers
export const referenceSelectors = {
  school: registerReferenceSelector<School, SchoolReference>(
    'schools',
    (school) => school.schoolName,
    (school) => ({
      schoolNumber: school.schoolNumber,
      district: school.district
    })
  ),
  
  staff: registerReferenceSelector<NYCPSStaff, StaffReference>(
    'nycps-staff',
    (staff) => staff.staffName,
    (staff) => ({
      email: staff.email,
      role: staff.rolesNYCPS?.[0]
    })
  ),
  
  teachingLabStaff: registerReferenceSelector<TeachingLabStaff, StaffReference>(
    'teaching-lab-staff',
    (staff) => staff.staffName,
    (staff) => ({
      email: staff.email,
      role: staff.rolesTL?.[0]
    })
  ),
  
  visit: registerReferenceSelector<Visit, VisitReference>(
    'visits',
    (visit) => `Visit: ${visit.date}`,
    (visit) => ({
      date: visit.date,
      school: visit.school
    })
  ),
  
  lookFor: registerReferenceSelector<LookFor, LookForReference>(
    'look-fors',
    (lookFor) => lookFor.topic,
    (lookFor) => ({
      lookForIndex: lookFor.lookForIndex
    })
  ),
  
  coachingLog: registerReferenceSelector<CoachingLog, CoachingLogReference>(
    'coaching-logs',
    (log) => log.primaryStrategy,
    (log) => ({
      solvesTouchpoint: log.solvesTouchpoint
    })
  )
};

// Legacy compatibility functions to bridge with existing code
// These maintain backward compatibility with your existing reference-mappers.ts
export function mapSchoolToReference(school: School): SchoolReference {
  return {
    _id: school._id,
    label: school.schoolName,
    value: school._id,
    schoolNumber: school.schoolNumber,
    district: school.district
  };
}

export function mapStaffToReference(staff: NYCPSStaff | TeachingLabStaff): StaffReference {
  return {
    _id: staff._id,
    label: staff.staffName,
    value: staff._id,
    email: staff.email,
    role: staff.rolesNYCPS?.[0] || staff.rolesTL?.[0]
  };
}

// Export legacy reference mappers for backward compatibility
export const referenceMappers = {
  school: mapSchoolToReference,
  staff: mapStaffToReference,
  // Map the rest directly to the new selectors
  schedule: (data: any) => referenceSelectors.school([data])[0],
  bellSchedule: (data: any) => referenceSelectors.school([data])[0],
  lookFor: (data: any) => referenceSelectors.lookFor([data])[0],
  visit: (data: any) => referenceSelectors.visit([data])[0],
  coachingLog: (data: any) => referenceSelectors.coachingLog([data])[0]
};
