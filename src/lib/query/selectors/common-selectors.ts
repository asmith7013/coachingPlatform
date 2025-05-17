import { registerEntitySelector } from './registry';
import { transformDateFieldsArray } from '@data-utilities/transformers/date-transformer';
import { SchoolWithDates } from '@/hooks/domain/useSchools';
import { StaffWithDates } from '@/hooks/domain/useUserStaff';
import { VisitWithDates } from '@/hooks/domain/useVisits';
import { CollectionResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';

/**
 * Register standard selectors for common entity types
 * This function registers default transformations for each entity type
 */
export function registerStandardSelectors(): void {
  // Register Schools selector
  registerEntitySelector<BaseDocument, SchoolWithDates[]>('schools', (data: CollectionResponse<BaseDocument>) => {
    return transformDateFieldsArray(data?.items || []) as SchoolWithDates[];
  });

  // Register Staff selector
  registerEntitySelector<BaseDocument, StaffWithDates[]>('staff', (data: CollectionResponse<BaseDocument>) => {
    return transformDateFieldsArray(data?.items || []) as StaffWithDates[];
  });

  // Register Visits selector
  registerEntitySelector<BaseDocument, VisitWithDates[]>('visits', (data: CollectionResponse<BaseDocument>) => {
    return transformDateFieldsArray(data?.items || []) as VisitWithDates[];
  });

  // Add more entity selectors as needed
} 