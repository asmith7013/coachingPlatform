import { getSelector } from '@query/client/selectors/selector-registry';
import { School } from '@zod-schema/core/school';
import { NYCPSStaff } from '@zod-schema/core/staff';
import { Visit } from '@zod-schema/visits/visit';

// Get standard selectors for common entity types
const schoolSelector = getSelector<School>('schools');
const nycpsStaffSelector = getSelector<NYCPSStaff>('nycps-staff');
const visitSelector = getSelector<Visit>('visits');

// Domain-specific transformations
export const enhancedSchoolSelector = schoolSelector.transform(school => ({
  ...school,
  hasStaff: Array.isArray(school.staffList) && school.staffList.length > 0,
  districtAndName: `${school.district} - ${school.schoolName}`
}));

export const enhancedStaffSelector = nycpsStaffSelector.transform(staff => ({
  ...staff,
  fullName: staff.staffName,
  hasSpecialGroups: Array.isArray(staff.specialGroups) && staff.specialGroups.length > 0
}));

// Combined domain operations
export function schoolsWithVisits(schoolData: unknown, visitData: unknown) {
  const schools = schoolSelector.basic(schoolData);
  const visits = visitSelector.basic(visitData);
  
  return schools.map(school => ({
    ...school,
    visits: visits.filter(visit => visit.school === school._id)
  }));
}

// Export domain selectors
export const domainSelectors = {
  enhancedSchool: enhancedSchoolSelector,
  enhancedStaff: enhancedStaffSelector,
  schoolsWithVisits
}; 