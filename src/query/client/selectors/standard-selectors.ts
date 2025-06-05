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
import { createReferenceSelector } from '@query/client/selectors/reference-selectors';
import { formatMediumDate, toDateString } from '@transformers/utils/date-utils';

/**
 * Create specialized selector variants for an entity type
 */
function createSpecializedSelectors<T extends BaseDocument>(
  baseSelector: EntitySelector<T>,
  entityType: string
) {
  return {
    base: baseSelector,
    reference: createReferenceSelector<T>(entityType),
    searchable: (data: unknown) => {
      try {
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
    detail: (data: unknown) => {
      try {
        const item = baseSelector.detail(data);
        if (!item) return null;
        
        return {
          ...item,
          formattedCreatedAt: item.createdAt ? formatMediumDate(toDateString(new Date(item.createdAt))) : undefined,
          formattedUpdatedAt: item.updatedAt ? formatMediumDate(toDateString(new Date(item.updatedAt))) : undefined
        };
      } catch (error) {
        handleClientError(error, `${entityType}.detail`);
        return null;
      }
    }
  };
}

// ✅ LAZY REGISTRATION - Create functions that register selectors when called
function getSchoolSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('schools', SchoolZodSchema as ZodType<School>),
      'schools'
    );
  } catch (error) {
    console.warn('Failed to register school selectors:', error);
    return null;
  }
}

function getStaffSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('staff', StaffMemberZodSchema as ZodType<StaffMember>),
      'staff'
    );
  } catch (error) {
    console.warn('Failed to register staff selectors:', error);
    return null;
  }
}

function getNYCPSStaffSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('nycps-staff', NYCPSStaffZodSchema as ZodType<NYCPSStaff>),
      'nycps-staff'
    );
  } catch (error) {
    console.warn('Failed to register NYCPS staff selectors:', error);
    return null;
  }
}

function getTeachingLabStaffSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('teaching-lab-staff', TeachingLabStaffZodSchema as ZodType<TeachingLabStaff>),
      'teaching-lab-staff'
    );
  } catch (error) {
    console.warn('Failed to register Teaching Lab staff selectors:', error);
    return null;
  }
}

function getCycleSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('cycles', CycleZodSchema as ZodType<Cycle>),
      'cycles'
    );
  } catch (error) {
    console.warn('Failed to register cycle selectors:', error);
    return null;
  }
}

function getVisitSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('visits', VisitZodSchema as ZodType<Visit>),
      'visits'
    );
  } catch (error) {
    console.warn('Failed to register visit selectors:', error);
    return null;
  }
}

function getCoachingLogSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('coaching-logs', CoachingLogZodSchema as ZodType<CoachingLog>),
      'coaching-logs'
    );
  } catch (error) {
    console.warn('Failed to register coaching log selectors:', error);
    return null;
  }
}

function getLookForSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('look-fors', LookForZodSchema as ZodType<LookFor>),
      'look-fors'
    );
  } catch (error) {
    console.warn('Failed to register look-for selectors:', error);
    return null;
  }
}

function getRubricSelectors() {
  try {
    return createSpecializedSelectors(
      registerSelector('rubrics', RubricZodSchema as ZodType<Rubric>),
      'rubrics'
    );
  } catch (error) {
    console.warn('Failed to register rubric selectors:', error);
    return null;
  }
}

// ✅ LAZY GETTER - Export with lazy getters that handle errors gracefully
export const standardSelectors = {
  get schools() { return getSchoolSelectors(); },
  get staff() { return getStaffSelectors(); },
  get nycpsStaff() { return getNYCPSStaffSelectors(); },
  get teachingLabStaff() { return getTeachingLabStaffSelectors(); },
  get cycles() { return getCycleSelectors(); },
  get visits() { return getVisitSelectors(); },
  get coachingLogs() { return getCoachingLogSelectors(); },
  get lookFors() { return getLookForSelectors(); },
  get rubrics() { return getRubricSelectors(); }
};

// Export individual selectors for direct imports (backward compatibility)
export const schoolSelector = () => getSchoolSelectors()?.base;
export const staffSelector = () => getStaffSelectors()?.base;
export const nycpsStaffSelector = () => getNYCPSStaffSelectors()?.base;
export const teachingLabStaffSelector = () => getTeachingLabStaffSelectors()?.base;
export const cycleSelector = () => getCycleSelectors()?.base;
export const visitSelector = () => getVisitSelectors()?.base;
export const coachingLogSelector = () => getCoachingLogSelectors()?.base;
export const lookForSelector = () => getLookForSelectors()?.base;
export const rubricSelector = () => getRubricSelectors()?.base; 