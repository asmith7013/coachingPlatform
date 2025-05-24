import { SchoolZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from '@zod-schema/core/staff';
import { VisitZodSchema } from '@zod-schema/visits/visit';
import { CoachingLogZodSchema } from '@zod-schema/visits/coaching-log';
import { LookForZodSchema } from '@zod-schema/look-fors/look-for';
import { registerSelector } from '@query/client/selectors/selector-registry';

// Register standard selectors
export const schoolSelector = registerSelector('schools', SchoolZodSchema);
export const nycpsStaffSelector = registerSelector('nycps-staff', NYCPSStaffZodSchema);
export const teachingLabStaffSelector = registerSelector('teaching-lab-staff', TeachingLabStaffZodSchema);
export const visitSelector = registerSelector('visits', VisitZodSchema);
export const coachingLogSelector = registerSelector('coaching-logs', CoachingLogZodSchema);
export const lookForSelector = registerSelector('look-fors', LookForZodSchema);

// Export all selectors as a collection
export const standardSelectors = {
  schools: schoolSelector,
  nycpsStaff: nycpsStaffSelector,
  teachingLabStaff: teachingLabStaffSelector,
  visits: visitSelector,
  coachingLogs: coachingLogSelector,
  lookFors: lookForSelector
}; 