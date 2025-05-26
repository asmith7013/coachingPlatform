import { School, SchoolZodSchema } from '@zod-schema/core/school';
import { 
  StaffMember, StaffMemberZodSchema,
  NYCPSStaff, NYCPSStaffZodSchema, 
  TeachingLabStaff, TeachingLabStaffZodSchema 
} from '@zod-schema/core/staff';
import { Cycle, CycleZodSchema } from '@zod-schema/core/cycle';
import { Visit, VisitZodSchema } from '@zod-schema/visits/visit';
import { CoachingLog, CoachingLogZodSchema } from '@zod-schema/visits/coaching-log';
import { LookFor, LookForZodSchema } from '@zod-schema/look-fors/look-for';
import { Rubric, RubricZodSchema } from '@zod-schema/look-fors/rubric';
import { registerSelector } from '@query/client/selectors/selector-factory';
import { EntitySelector } from '@query/client/selectors/selector-types';
import { handleClientError } from '@error/handlers/client';
import { BaseDocument } from '@core-types/document';
import { ZodType } from 'zod';
import { getSearchableText } from '@query/client/utilities/selector-helpers';
// Import the consolidated reference selector function
import { createReferenceSelector } from '@query/client/selectors/reference-selectors';

/**
 * Create specialized selector variants for an entity type
 * 
 * @param baseSelector The base selector to extend
 * @param entityType The entity type name for error context
 * @returns An object containing specialized selector variants
 */
function createSpecializedSelectors<T extends BaseDocument>(
  baseSelector: EntitySelector<T>,
  entityType: string
) {
  return {
    // Basic selector
    base: baseSelector,
    
    // Reference selector for dropdowns - UPDATED to use consolidated function
    reference: createReferenceSelector<T>(entityType),
    
    // Searchable selector that adds a searchable text field
    searchable: (data: unknown) => {
      try {
        // Use baseSelector.basic to get items (which now uses normalizeToArray internally)
        const items = baseSelector.basic(data);
        return items.map(item => ({
          ...item,
          searchableText: getSearchableText(item)
        }));
      } catch (error) {
        handleClientError(error, `${entityType}.searchable`);
        return [];
      }
    },
    
    // Detail selector with formatted dates
    detail: (data: unknown) => {
      try {
        // Use baseSelector.detail to get item (which now uses normalizeToArray internally)
        const item = baseSelector.detail(data);
        if (!item) return null;
        
        return {
          ...item,
          formattedCreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : undefined,
          formattedUpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : undefined
        };
      } catch (error) {
        handleClientError(error, `${entityType}.detail`);
        return null;
      }
    }
  };
}
// Register and create specialized selectors for all entity types
const schoolSelectors = createSpecializedSelectors(
  registerSelector('schools', SchoolZodSchema as ZodType<School>),
  'schools'
);

const staffSelectors = createSpecializedSelectors(
  registerSelector('staff', StaffMemberZodSchema as ZodType<StaffMember>),
  'staff'
);

const nycpsStaffSelectors = createSpecializedSelectors(
  registerSelector('nycps-staff', NYCPSStaffZodSchema as ZodType<NYCPSStaff>),
  'nycps-staff'
);

const teachingLabStaffSelectors = createSpecializedSelectors(
  registerSelector('teaching-lab-staff', TeachingLabStaffZodSchema as ZodType<TeachingLabStaff>),
  'teaching-lab-staff'
);

const cycleSelectors = createSpecializedSelectors(
  registerSelector('cycles', CycleZodSchema as ZodType<Cycle>),
  'cycles'
);

const visitSelectors = createSpecializedSelectors(
  registerSelector('visits', VisitZodSchema as ZodType<Visit>),
  'visits'
);

const coachingLogSelectors = createSpecializedSelectors(
  registerSelector('coaching-logs', CoachingLogZodSchema as ZodType<CoachingLog>),
  'coaching-logs'
);

const lookForSelectors = createSpecializedSelectors(
  registerSelector('look-fors', LookForZodSchema as ZodType<LookFor>),
  'look-fors'
);

const rubricSelectors = createSpecializedSelectors(
  registerSelector('rubrics', RubricZodSchema as ZodType<Rubric>),
  'rubrics'
);

// Export all selectors as a standardized collection
export const standardSelectors = {
  schools: schoolSelectors,
  staff: staffSelectors,
  nycpsStaff: nycpsStaffSelectors,
  teachingLabStaff: teachingLabStaffSelectors,
  cycles: cycleSelectors,
  visits: visitSelectors,
  coachingLogs: coachingLogSelectors,
  lookFors: lookForSelectors,
  rubrics: rubricSelectors
};

// Export individual selectors for direct imports (backward compatibility)
export const schoolSelector = schoolSelectors.base;
export const staffSelector = staffSelectors.base;
export const nycpsStaffSelector = nycpsStaffSelectors.base;
export const teachingLabStaffSelector = teachingLabStaffSelectors.base;
export const cycleSelector = cycleSelectors.base;
export const visitSelector = visitSelectors.base;
export const coachingLogSelector = coachingLogSelectors.base;
export const lookForSelector = lookForSelectors.base;
export const rubricSelector = rubricSelectors.base; 