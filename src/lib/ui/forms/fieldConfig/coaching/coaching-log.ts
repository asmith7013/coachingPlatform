import { CoachingLogInput } from '@zod-schema/visits/coaching-log';
import {
  ReasonDone,
  TotalDuration,
  SolvesTouchpoint,
  NYCSolvesAdmin,
  AdminDone,
} from '@enums';

/**
 * Simple field mappings for CoachingLog forms
 * Focuses on providing proper defaults and value transformations
 */

// Boolean field mappings for Yes/No dropdowns
export const BooleanFieldMappings = {
  oneOnOneCoachingDone: {
    label: "Did you provide 1:1 coaching at this school today?",
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
  microPLDone: {
    label: "Did you deliver a micro PL at this school today?",
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
  modelingPlanningDone: {
    label: "Did you provide modeling or planning with teachers at this school today?",
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
  walkthroughDone: {
    label: "Did you conduct classroom walkthroughs at this school today?",
    transformToForm: (value: boolean) => value ? "Yes" : "No", 
    parseFromForm: (value: string) => value === "Yes",
  },
  // DEPRECATED: Keep for backward compatibility
  CoachingDone: {
    label: "Did you provide coaching, modeling, or planning with a group of teachers at this school today?", 
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
  adminMeet: {
    label: "Administrator Meeting",
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
  isContractor: {
    label: "Is Contractor",
    transformToForm: (value: boolean) => value ? "Yes" : "No",
    parseFromForm: (value: string) => value === "Yes",
  },
};

// Enum field mappings
export const EnumFieldMappings = {
  reasonDone: {
    label: "Reason Done",
    options: Object.values(ReasonDone),
  },
  totalDuration: {
    label: "Total Duration", 
    options: Object.values(TotalDuration),
  },
  solvesTouchpoint: {
    label: "Solves Touchpoint",
    options: Object.values(SolvesTouchpoint),
  },
  NYCSolvesAdmin: {
    label: "NYC Solves Admin Meeting",
    options: Object.values(NYCSolvesAdmin),
  },
  adminDone: {
    label: "Admin Progress Meeting",
    options: Object.values(AdminDone),
  },
};

// NYC Coach status special mapping
export const NYCCoachMapping = {
  label: "NYC Coach Status",
  transformToForm: (value: boolean) => value ? "Yes, NYC Solves" : "No",
  parseFromForm: (value: string) => value.startsWith("Yes"),
  options: [
    "Yes, NYC Solves",
    "Yes, NYC Other", 
    "No"
  ],
};

/**
 * Transform schema boolean value to form string value
 */
export function transformBooleanForForm(fieldName: keyof typeof BooleanFieldMappings, value: boolean): string {
  const mapping = BooleanFieldMappings[fieldName];
  return mapping ? mapping.transformToForm(value) : (value ? "Yes" : "No");
}

/**
 * Parse form string value back to schema boolean value
 */
export function parseBooleanFromForm(fieldName: keyof typeof BooleanFieldMappings, value: string): boolean {
  const mapping = BooleanFieldMappings[fieldName];
  return mapping ? mapping.parseFromForm(value) : value === "Yes";
}

/**
 * Get smart default value for a boolean field based on schema data
 */
export function getSmartBooleanDefault(
  fieldName: keyof typeof BooleanFieldMappings,
  coachingLog: Partial<CoachingLogInput>
): boolean {
  switch (fieldName) {
    case 'oneOnOneCoachingDone':
      // ✅ EXPLICIT: Use field value if provided, otherwise default to true
      return (coachingLog.oneOnOneCoachingDone as boolean | undefined) ?? true;
      
    case 'microPLDone':
      // ✅ FIXED: Use explicit field value if provided, otherwise default to false
      if (coachingLog.microPLDone !== undefined) {
        return coachingLog.microPLDone as boolean;
      }
      // Only infer from data if no explicit value AND there's actual content
      return !!((coachingLog.microPLTopic as string)?.trim()) ||
             !!((coachingLog.microPLDuration as number) > 0);
      
    case 'modelingPlanningDone':
      // ✅ FIXED: Use explicit field value if provided, otherwise default to false
      if (coachingLog.modelingPlanningDone !== undefined) {
        return coachingLog.modelingPlanningDone as boolean;
      }
      // Only infer from data if no explicit value AND there's actual content
      return !!((coachingLog.modelTopic as string)?.trim()) ||
             !!((coachingLog.modelDuration as number) > 0);
      
    case 'walkthroughDone':
      return (coachingLog.walkthroughDone as boolean | undefined) ?? false;
      
    case 'adminMeet':
      if (coachingLog.adminMeet !== undefined) {
        return coachingLog.adminMeet as boolean;
      }
      return !!((coachingLog.adminMeetDuration as number) > 0);
      
    case 'isContractor':
      return (coachingLog.isContractor as boolean | undefined) ?? true;

    default:
      return false;
  }
}

// Remove the complex field configuration since it has TypeScript issues
// Focus on the simple mapping approach that solves the core problem 