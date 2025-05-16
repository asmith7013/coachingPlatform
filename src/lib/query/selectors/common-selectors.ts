import { registerEntitySelector } from './registry';
import { transformDateFieldsArray } from '@data-utilities/transformers/date-transformer';
import { SchoolWithDates } from '@domain-hooks/useSchoolsRQ';
import { StaffWithDates } from '@domain-hooks/useStaffRQ';
import { VisitWithDates } from '@domain-hooks/useVisitsRQ';
import { StandardResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';

/**
 * Register standard selectors for common entity types
 * This function registers default transformations for each entity type
 */
export function registerStandardSelectors(): void {
  // Register Schools selector
  registerEntitySelector<BaseDocument, SchoolWithDates[]>('schools', (data: StandardResponse<BaseDocument>) => {
    return transformDateFieldsArray(data?.items || []) as SchoolWithDates[];
  });

  // Register Staff selector
  registerEntitySelector<unknown, StaffWithDates[]>('staff', (data: StandardResponse<unknown>) => {
    return transformDateFieldsArray(data?.items || []) as StaffWithDates[];
  });

  // Register Visits selector
  registerEntitySelector<unknown, VisitWithDates[]>('visits', (data: StandardResponse<unknown>) => {
    return transformDateFieldsArray(data?.items || []) as VisitWithDates[];
  });

  // Add more entity selectors as needed
} 