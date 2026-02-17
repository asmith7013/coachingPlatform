// src/query/client/selectors/reference-selectors.ts

import { BaseDocument } from "@core-types/document";
import {
  EntitySelector,
  SelectorFunction,
} from "@query/client/selectors/selector-types";
import { getSelector } from "@query/client/selectors/selector-factory";
import { handleClientError } from "@error/handlers/client";
import {
  createReferenceTransformer,
  createArrayTransformer,
} from "@/lib/data-processing/transformers/factories/reference-factory";
import { getEntityLabel } from "@query/client/utilities/selector-helpers";

// Import entity types
import { School } from "@zod-schema/core/school";
import { NYCPSStaff, TeachingLabStaff } from "@zod-schema/core/staff";
import { Visit } from "@zod-schema/visits/visit";
import { CoachingLog } from "@zod-schema/visits/coaching-log";
import { LookFor } from "@zod-schema/look-fors/look-for";

// Import base reference type
import { BaseReference } from "@core-types/reference";

// Import entity-specific reference types from their domain files
import { SchoolReference } from "@zod-schema/core/school";
import { StaffReference } from "@zod-schema/core/staff";
import { VisitReference } from "@zod-schema/visits/visit";
import { CoachingLogReference } from "@zod-schema/visits/coaching-log";
import { LookForReference } from "@zod-schema/look-fors/look-for";

/**
 * Creates a standard reference selector function for any entity type
 * Centralizes reference transformation logic in one place
 *
 * @param entityType The type of entity to create a reference selector for
 * @param getLabelFn Optional custom function to extract entity label
 * @returns A selector function that transforms data into reference format
 */
export function createReferenceSelector<T extends BaseDocument>(
  entityType: string,
  getLabelFn: (entity: T) => string = getEntityLabel,
): SelectorFunction<T, Array<{ value: string; label: string }>> {
  return (data: unknown) => {
    try {
      // Get the base selector
      const selector = getSelector<T>(entityType);

      // Extract and transform items
      const items = selector.basic(data);

      // Create reference objects
      return items.map((item) => ({
        value: item._id,
        label: getLabelFn(item),
      }));
    } catch (error) {
      handleClientError(error, `referenceSelector:${entityType}`);
      return [];
    }
  };
}

/**
 * Creates a reference object transformation function
 * Used for more complex reference objects beyond value/label
 *
 * @param getLabelFn Function to extract entity label
 * @param getAdditionalFields Function to extract additional reference fields
 * @returns A function that transforms an entity into a reference object
 */
export function createReferenceObjectTransformer<
  T extends BaseDocument,
  R extends BaseReference = BaseReference,
>(
  getLabelFn: (entity: T) => string = getEntityLabel,
  getAdditionalFields?: (
    entity: T,
  ) => Partial<Omit<R, "_id" | "label" | "value">>,
) {
  return (entity: T): R => {
    try {
      // Create base reference
      const reference: Record<string, unknown> = {
        _id: entity._id,
        value: entity._id,
        label: getLabelFn(entity),
      };

      // Add additional fields if provided
      if (getAdditionalFields) {
        Object.assign(reference, getAdditionalFields(entity));
      }

      return reference as R;
    } catch (error) {
      handleClientError(error, "createReferenceObject");
      // Return minimal valid reference to avoid breaking consumers
      return {
        _id: entity._id,
        value: entity._id,
        label: String(entity._id),
      } as unknown as R;
    }
  };
}

/**
 * Enhanced selector factory extension for references
 * Extends an existing selector with reference capabilities by integrating
 * with the reference transformer utility
 */
export function enhanceWithReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference,
>(
  selector: EntitySelector<T>,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (
    entity: T,
  ) => Partial<Omit<R, "_id" | "label" | "value">>,
): EntitySelector<T> & {
  enhancedReference: (data: unknown) => R[];
} {
  // Create reference transformer using the utility
  const transformer = createReferenceTransformer<T, R>(
    getLabelFn,
    getAdditionalFields,
  );

  // Create array transformer for processing collections
  const arrayTransformer = createArrayTransformer<T, R>(transformer);

  // Create enhanced reference selector function
  const enhancedReference = (data: unknown): R[] => {
    try {
      // Use selector.basic to get items (which now uses normalizeToArray internally)
      const items = selector.basic(data);
      // Apply the reference transformation
      return arrayTransformer(items);
    } catch (error) {
      handleClientError(error, "enhancedReference");
      return [];
    }
  };

  // Return the enhanced selector
  return {
    ...selector,
    enhancedReference,
  };
}

/**
 * Registers a reference selector for an entity type using the reference transformer
 */
export function registerReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference,
>(
  entityType: string,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (
    entity: T,
  ) => Partial<Omit<R, "_id" | "label" | "value">>,
): (data: unknown) => R[] {
  // Get or create the selector for this entity type
  const selector = getSelector<T>(entityType);

  // Create the enhanced selector
  const enhanced = enhanceWithReferenceSelector<T, R>(
    selector,
    getLabelFn,
    getAdditionalFields,
  );

  // Return the enhanced reference function
  return enhanced.enhancedReference;
}

/**
 * Export a simple function to get reference options for any entity type
 * This is the primary function that should be used for basic reference selectors
 *
 * @param entityType The entity type to get references for
 * @param data The data to transform
 * @returns Array of value/label reference objects
 */
export function getReferenceOptions<T extends BaseDocument>(
  entityType: string,
  data: unknown,
): Array<{ value: string; label: string }> {
  return createReferenceSelector<T>(entityType)(data);
}

// Pre-configure common reference transformers - LAZY LOADING
export const referenceSelectors = {
  get school() {
    try {
      return registerReferenceSelector<School, SchoolReference>(
        "schools",
        (school) => school.schoolName,
        (school) => ({
          schoolNumber: school.schoolNumber,
          district: school.district,
        }),
      );
    } catch (error) {
      console.warn("Failed to register school reference selector:", error);
      return null;
    }
  },

  get staff() {
    try {
      return registerReferenceSelector<NYCPSStaff, StaffReference>(
        "nycps-staff",
        (staff) => staff.staffName,
        (staff) => ({
          email: staff.email,
          role: staff.rolesNYCPS?.[0],
        }),
      );
    } catch (error) {
      console.warn("Failed to register staff reference selector:", error);
      return null;
    }
  },

  get teachingLabStaff() {
    try {
      return registerReferenceSelector<TeachingLabStaff, StaffReference>(
        "teaching-lab-staff",
        (staff) => staff.staffName,
        (staff) => ({
          email: staff.email,
          role: staff.rolesTL?.[0],
        }),
      );
    } catch (error) {
      console.warn(
        "Failed to register teaching lab staff reference selector:",
        error,
      );
      return null;
    }
  },

  get visit() {
    try {
      return registerReferenceSelector<Visit, VisitReference>(
        "visits",
        (visit) => `Visit: ${visit.date}`,
        (visit) => ({
          date: visit.date,
          schoolId: visit.schoolId,
        }),
      );
    } catch (error) {
      console.warn("Failed to register visit reference selector:", error);
      return null;
    }
  },

  get lookFor() {
    try {
      return registerReferenceSelector<LookFor, LookForReference>(
        "look-fors",
        (lookFor) => lookFor.topic,
        (lookFor) => ({
          lookForIndex: lookFor.lookForIndex,
        }),
      );
    } catch (error) {
      console.warn("Failed to register look-for reference selector:", error);
      return null;
    }
  },

  get coachingLog() {
    try {
      return registerReferenceSelector<CoachingLog, CoachingLogReference>(
        "coaching-logs",
        (log) =>
          log.primaryStrategySpecific || log.primaryStrategy || "Coaching Log",
        (log) => ({
          solvesTouchpoint: log.solvesTouchpoint,
          implementationExperience: log.implementationExperience,
          primaryStrategyCategory: log.primaryStrategyCategory,
        }),
      );
    } catch (error) {
      console.warn(
        "Failed to register coaching log reference selector:",
        error,
      );
      return null;
    }
  },
};

/**
 * Maps a school entity to a school reference object
 * Used by API routes for backward compatibility
 */
export function mapSchoolToReference(school: School): SchoolReference {
  const transformer = createReferenceObjectTransformer<School, SchoolReference>(
    (school) => school.schoolName,
    (school) => ({
      schoolNumber: school.schoolNumber,
      district: school.district,
      gradeLevels: school.gradeLevelsSupported,
      staffCount: school.staffListIds?.length || 0,
    }),
  );

  return transformer(school);
}

/**
 * Maps a staff entity to a staff reference object
 * Used by API routes for backward compatibility
 */
export function mapStaffToReference(
  staff: NYCPSStaff | TeachingLabStaff,
): StaffReference {
  const transformer = createReferenceObjectTransformer<
    NYCPSStaff | TeachingLabStaff,
    StaffReference
  >(
    (staff) => staff.staffName,
    (staff) => ({
      email: staff.email,
      role:
        "rolesNYCPS" in staff
          ? staff.rolesNYCPS?.[0]
          : "rolesTL" in staff
            ? staff.rolesTL?.[0]
            : undefined,
    }),
  );

  return transformer(staff);
}
