import { z } from 'zod';
import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { BellScheduleInputZodSchema } from '@/lib/schema/zod-schema/schedules/schedule';
import { TeacherScheduleInputZodSchema } from '@/lib/schema/zod-schema/schedules/schedule';

// Use transformer validation and shared utilities
import { validateSafe } from '@/lib/data-processing/validation/zod-validation';
import { handleClientError } from '@error/handlers/client';
import { extractSchemaFields } from '@/lib/data-processing/transformers/ui/schema-utils';

// Import actual enums from shared-enums
import {
  GradeLevels,
  Subjects,
  SpecialGroups,
  RolesNYCPS,
  RolesTL,
  AdminLevels,
  AllowedPurposes,
  ModeDone,
  BellScheduleTypes,
  DayTypes,
  BlockDayTypes,
  PeriodTypes
} from '@schema/enum/shared-enums';

/**
 * Create template using shared schema utilities
 */
function createTemplateFromSchema<T>(schema: z.ZodSchema<T>): Record<string, unknown> {
  const fields = extractSchemaFields(schema);
  const template: Record<string, unknown> = {};
  
  // Use consistent field default logic (simplified)
  fields.forEach(field => {
    template[field] = getFieldDefault(field);
  });
  
  return template;
}

/**
 * Simplified field default logic - remove duplication with transformers
 */
function getFieldDefault(fieldName: string): unknown {
  // Array fields that transformers also recognize
  const arrayFields = [
    'gradeLevelsSupported', 'subjects', 'specialGroups', 'rolesNYCPS', 'rolesTL',
    'staffList', 'schedules', 'cycles', 'owners', 'schools', 'notes', 'experience',
    'assignedDistricts', 'events', 'sessionLinks', 'classSchedule'
  ];
  
  return arrayFields.includes(fieldName) ? [] : "";
}

/**
 * Manual template for Visit - but validate with transformers
 */
function createVisitTemplate(): Record<string, unknown> {
  const template = {
    // Required fields
    date: "",
    school: "",
    coach: "",
    gradeLevelsSupported: [],
    owners: [],
    
    // Optional fields
    cycleRef: "",
    allowedPurpose: "",
    modeDone: "",
    events: [],
    sessionLinks: [],
    
    // Monday.com integration fields
    mondayItemId: "",
    mondayBoardId: "",
    mondayItemName: "",
    mondayLastSyncedAt: "",
    siteAddress: "",
    endDate: "",
  };
  
  // Validate template structure using transformer
  const validation = validateSafe(VisitInputZodSchema.partial(), template);
  if (!validation) {
    console.warn('Visit template validation failed - using fallback');
  }
  
  return template;
}

/**
 * Manual template for Bell Schedule - but validate with transformers
 */
function createBellScheduleTemplate(): Record<string, unknown> {
  const template = {
    // Required fields
    school: "", // Will be auto-filled with selected school ID
    bellScheduleType: "", // uniform, weeklyCycle, or abcCycle
    classSchedule: [], // Array of class schedule items
    assignedCycleDays: [], // Array of assigned cycle days
    owners: [], // Will be auto-filled
    
    // Example structures to guide AI
    exampleClassScheduleItem: {
      dayType: "Monday", // or A, B, C for cycle schedules
      startTime: "08:00",
      endTime: "08:45"
    },
    
    exampleAssignedCycleDay: {
      date: "2024-01-15", // Date object will be handled by zDateField
      blockDayType: "A" // A, B, or C
    }
  };
  
  // Validate template structure using transformer
  const validation = validateSafe(BellScheduleInputZodSchema.partial(), template);
  if (!validation) {
    console.warn('Bell schedule template validation failed - using fallback');
  }
  
  return template;
}

/**
 * Manual template for Master Schedule - but validate with transformers
 */
function createMasterScheduleTemplate(): Record<string, unknown> {
  const template = {
    teacherSchedules: [
      {
        teacherName: "John Smith",
        teacherEmail: "jsmith@school.edu", 
        bellScheduleId: "", // Will be auto-filled
        dayIndices: [0, 1, 2, 3, 4], // Monday through Friday
        assignments: [
          {
            periodNumber: 1,
            className: "Algebra I",
            room: "101",
            activityType: "teaching",
            subject: "Mathematics",
            gradeLevel: "Grade 9"
          },
          {
            periodNumber: 2,
            className: "Preparation Period",
            room: "101",
            activityType: "prep"
          }
        ]
      }
    ]
  };
  
  return template;
}

/**
 * Enum mapping - keep this as it's domain-specific knowledge
 */
const FIELD_TO_ENUM_MAP = {
  gradeLevelsSupported: { name: 'GradeLevels', enum: GradeLevels },
  subjects: { name: 'Subjects', enum: Subjects },
  specialGroups: { name: 'SpecialGroups', enum: SpecialGroups },
  rolesNYCPS: { name: 'RolesNYCPS', enum: RolesNYCPS },
  rolesTL: { name: 'RolesTL', enum: RolesTL },
  adminLevel: { name: 'AdminLevels', enum: AdminLevels },
  allowedPurpose: { name: 'AllowedPurposes', enum: AllowedPurposes },
  modeDone: { name: 'ModeDone', enum: ModeDone },
  bellScheduleType: { name: 'BellScheduleTypes', enum: BellScheduleTypes },
  dayType: { name: 'DayTypes', enum: DayTypes },
  blockDayType: { name: 'BlockDayTypes', enum: BlockDayTypes },
  periodType: { name: 'PeriodTypes', enum: PeriodTypes }
};

/**
 * Generate enum definitions - simplified
 */
function formatEnumDefinition(enumName: string, enumObj: Record<string, string>): string {
  const enumEntries = Object.entries(enumObj)
    .map(([key, value]) => `  ${key} = "${value}"`)
    .join(',\n');
  
  return `export enum ${enumName} {
${enumEntries}
}`;
}

/**
 * Generate enum definitions for relevant fields
 */
function generateEnumDefinitions(templateFields: string[]): string {
  const relevantEnums = templateFields
    .filter(field => FIELD_TO_ENUM_MAP[field as keyof typeof FIELD_TO_ENUM_MAP])
    .map(field => {
      const enumMapping = FIELD_TO_ENUM_MAP[field as keyof typeof FIELD_TO_ENUM_MAP];
      const formattedEnum = formatEnumDefinition(enumMapping.name, enumMapping.enum);
      return `"${field}": ${formattedEnum}`;
    });
  
  return relevantEnums.length > 0 
    ? `\nValid enums for properties:\n${relevantEnums.join('\n\n')}`
    : '';
}

/**
 * Field instructions - keep this as it's user-facing content
 */
function generateFieldInstructions(entityName: string): string {
  switch (entityName) {
    case 'school':
      return `CRITICAL REQUIREMENTS:
- schoolNumber: Official school identifier (REQUIRED)
- district: School district name (REQUIRED)  
- schoolName: Full school name (REQUIRED)
- gradeLevelsSupported: Array of grade levels (can be empty array [])
- owners: Array of owner IDs (MUST be empty array [])`;
    
    case 'staff':
      return `Instructions:
- IMPORTANT: Return an ARRAY of staff objects, even for single person
- staffName: Full name (required)
- email: Email address (required)
- Arrays like schools/notes/experience: Leave empty []`;
    
    case 'visits':
      return `CRITICAL REQUIREMENTS:
- IMPORTANT: Return an ARRAY of visit objects, even for single visit
- date: Visit date in YYYY-MM-DD format (REQUIRED)
- school: School ID (REQUIRED)
- coach: Coach name or ID (REQUIRED)
- gradeLevelsSupported: Array of grade levels (REQUIRED)
- owners: Array of owner IDs (REQUIRED)`;
    
    case 'bellSchedules':
      return `CRITICAL REQUIREMENTS:
- IMPORTANT: Return an ARRAY of bell schedule objects, even for single schedule
- school: Will be auto-filled (leave as empty string "")
- bellScheduleType: MUST be exactly one of: "uniform", "weeklyCycle", "abcCycle" (REQUIRED)
- classSchedule: Array of periods with dayType, startTime, endTime (REQUIRED)
  * For uniform schedules: use "uniform" as dayType
  * For weekly cycles: use "Monday", "Tuesday", etc.
  * For ABC cycles: use "A", "B", "C"
- assignedCycleDays: Array of date assignments (REQUIRED for non-uniform schedules)
  * date: Use "YYYY-MM-DD" format (e.g., "2024-01-15")
  * blockDayType: Must be "A", "B", or "C"
- owners: Will be auto-filled (leave as empty array [])
- Time format: Use "HH:MM" 24-hour format (e.g., "08:00", "15:30")`;
    
    case 'masterSchedule':
      return `CRITICAL REQUIREMENTS:
- IMPORTANT: Return a complete master schedule for the school
- teacherSchedules: Array of teacher schedules
  * teacherName: Full name of the teacher (REQUIRED)
  * teacherEmail: Email address of the teacher (REQUIRED)
  * bellScheduleId: Reference to bell schedule (leave empty - will be auto-filled)
  * dayIndices: Array of day numbers this schedule applies to [0,1,2,3,4] for M-F (REQUIRED)
  * assignments: Flat array of all period assignments (REQUIRED)
    - periodNumber: Period number 1-8 (REQUIRED)
    - className: Class name (REQUIRED)
    - room: Room number (REQUIRED)
    - activityType: "teaching", "prep", "lunch", "meeting" (REQUIRED)
    - subject: Subject name (optional)
    - gradeLevel: Grade level (optional)`;
    
    default:
      return '';
  }
}

// =============================================================================
// PUBLIC API - Simplified using transformers
// =============================================================================

/**
 * Generate templates using transformer-based approach
 */
export const SCHOOL_TEMPLATE = createTemplateFromSchema(SchoolInputZodSchema);
export const STAFF_TEMPLATE = createTemplateFromSchema(NYCPSStaffInputZodSchema);
export const VISIT_TEMPLATE = createVisitTemplate();
export const BELL_SCHEDULE_TEMPLATE = createBellScheduleTemplate();
export const MASTER_SCHEDULE_TEMPLATE = createMasterScheduleTemplate();

/**
 * Validate template data using consolidated validateSafe approach
 */
export function validateTemplateData(
  data: unknown, 
  type: 'school' | 'staff' | 'visits' | 'bellSchedules' | 'masterSchedule'
): { success: boolean; data?: unknown; error?: string } {
  const schemas = {
    school: SchoolInputZodSchema,
    staff: NYCPSStaffInputZodSchema,
    visits: VisitInputZodSchema,
    bellSchedules: BellScheduleInputZodSchema,
    masterSchedule: TeacherScheduleInputZodSchema
  };
  
  const schema = schemas[type];
  if (!schema) {
    return { success: false, error: 'Unknown entity type' };
  }
  
  try {
    // Handle array types for staff, visits, and bell schedules
    if (type === 'staff' || type === 'visits' || type === 'bellSchedules' || type === 'masterSchedule') {
      const dataArray = Array.isArray(data) ? data : [data];
      const validatedItems = dataArray
        .map(item => validateSafe(schema, item))
        .filter(Boolean);
      
      return validatedItems.length > 0
        ? { success: true, data: validatedItems }
        : { success: false, error: 'Validation failed' };
    }
    
    // Handle single item for school
    const result = validateSafe(schema, data);
    return result 
      ? { success: true, data: result }
      : { success: false, error: 'Validation failed' };
      
  } catch (error) {
    const errorMessage = handleClientError(error, 'validateTemplateData');
    return { success: false, error: errorMessage };
  }
}

/**
 * Get field information using transformer patterns
 */
export function getFieldInfo(type: 'school' | 'staff' | 'visits' | 'bellSchedules' | 'masterSchedule') {
  switch (type) {
    case 'school':
      return {
        template: SCHOOL_TEMPLATE,
        fields: extractSchemaFields(SchoolInputZodSchema),
        schema: SchoolInputZodSchema
      };
    case 'staff':
      return {
        template: STAFF_TEMPLATE,
        fields: extractSchemaFields(NYCPSStaffInputZodSchema),
        schema: NYCPSStaffInputZodSchema
      };
    case 'visits':
      return {
        template: VISIT_TEMPLATE,
        fields: Object.keys(VISIT_TEMPLATE),
        schema: VisitInputZodSchema
      };
    case 'bellSchedules':
      return {
        template: BELL_SCHEDULE_TEMPLATE,
        fields: Object.keys(BELL_SCHEDULE_TEMPLATE),
        schema: BellScheduleInputZodSchema
      };
    case 'masterSchedule':
      return {
        template: MASTER_SCHEDULE_TEMPLATE,
        fields: Object.keys(MASTER_SCHEDULE_TEMPLATE),
        schema: TeacherScheduleInputZodSchema
      };
    default:
      throw new Error('Unknown entity type');
  }
}

/**
 * Generate AI prompts using transformer-validated templates
 */
export const AI_PROMPTS = {
  school: (() => {
    const info = getFieldInfo('school');
    return `Fill this JSON schema with school information:

${JSON.stringify(info.template, null, 2)}

${generateFieldInstructions('school')}

Return VALID JSON with ALL fields present.${generateEnumDefinitions(info.fields)}`;
  })(),

  staff: (() => {
    const info = getFieldInfo('staff');
    return `Fill this JSON schema with staff information:

${JSON.stringify(info.template, null, 2)}

${generateFieldInstructions('staff')}

Return only valid JSON array.${generateEnumDefinitions(info.fields)}`;
  })(),

  visits: (() => {
    const info = getFieldInfo('visits');
    return `Fill this JSON schema with visit information:

${JSON.stringify(info.template, null, 2)}

${generateFieldInstructions('visits')}

Return only valid JSON array.${generateEnumDefinitions(info.fields)}`;
  })(),

  bellSchedules: (() => {
    const info = getFieldInfo('bellSchedules');
    return `Fill this JSON schema with bell schedule information:

${JSON.stringify(info.template, null, 2)}

${generateFieldInstructions('bellSchedules')}

Return only valid JSON array.${generateEnumDefinitions(info.fields)}`;
  })(),

  masterSchedule: (() => {
    const info = getFieldInfo('masterSchedule');
    return `Fill this JSON schema with master schedule information:

${JSON.stringify(info.template, null, 2)}

${generateFieldInstructions('masterSchedule')}

Return only valid JSON array.${generateEnumDefinitions(info.fields)}`;
  })()
};

/**
 * Create dynamic master schedule prompt that includes school staff
 */
export function createMasterSchedulePrompt(schoolStaff: Array<{ staffName: string; email: string }>): string {
  const staffList = schoolStaff.map(staff => 
    `- ${staff.staffName} (${staff.email})`
  ).join('\n');

  const template = createMasterScheduleTemplate();

  return `Create a complete master schedule for this school using ONLY the staff members listed below.

AVAILABLE STAFF MEMBERS AT THIS SCHOOL:
${staffList}

${JSON.stringify(template, null, 2)}

${generateFieldInstructions('masterSchedule')}

IMPORTANT MATCHING RULES:
- Use EXACT email addresses from the staff list above
- Match teacher names to the staff list (e.g., "Smith" should match "John Smith" with email "jsmith@school.edu")
- Every teacher schedule MUST use an email from the available staff list
- If you reference a teacher not in the list above, that schedule will be rejected

Return VALID JSON with teacher schedules ONLY for staff members listed above.`;
} 