import { z } from 'zod';
import { SchoolInputZodSchema } from '@zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@zod-schema/core/staff';

// Import actual enums from shared-enums
import {
  GradeLevels,
  Subjects,
  SpecialGroups,
  RolesNYCPS,
  RolesTL,
  AdminLevels,
  AllowedPurposes,
  ModeDone
} from '@schema/enum/shared-enums';

/**
 * Generate template by parsing an empty object and using error paths
 */
function getSchemaFields<T>(schema: z.ZodSchema<T>): string[] {
  const result = schema.safeParse({});
  if (result.success) return [];
  
  const fields = result.error.errors
    .map(err => err.path[0])
    .filter((path): path is string => typeof path === 'string');
  
  console.log('📝 Detected schema fields:', fields);
  return fields;
}

/**
 * Create manual template for Visit with correct field requirements
 * Based on VisitInputZodSchema = toInputSchema(BaseDocumentSchema.merge(VisitFieldsSchema))
 * 
 * Manual approach needed because zDateField's preprocessing makes date field
 * not fail validation on empty object, so getSchemaFields() misses it
 */
function createVisitTemplate(): Record<string, unknown> {
  return {
    // REQUIRED fields from VisitFieldsSchema
    date: "",                    // zDateField - REQUIRED (but flexible validation)
    school: "",                  // z.string() - REQUIRED  
    coach: "",                   // z.string() - REQUIRED
    gradeLevelsSupported: [],    // z.array(GradeLevelsSupportedZod) - REQUIRED
    
    // REQUIRED from BaseDocumentSchema (after toInputSchema removes system fields)
    owners: [],                  // z.array(z.string()).default([]) - REQUIRED
    
    // OPTIONAL fields from VisitFieldsSchema
    cycleRef: "",               // z.string().optional()
    allowedPurpose: "",         // AllowedPurposeZod.optional()
    modeDone: "",               // ModeDoneZod.optional()
    events: [],                 // z.array(EventItemZodSchema).optional()
    sessionLinks: [],           // z.array(SessionLinkZodSchema).optional()
    
    // OPTIONAL Monday.com integration fields
    mondayItemId: "",           // z.string().optional()
    mondayBoardId: "",          // z.string().optional()
    mondayItemName: "",         // z.string().optional()
    mondayLastSyncedAt: "",     // zDateField.optional()
    siteAddress: "",            // z.string().optional()
    endDate: "",                // zDateField.optional()
  };
}

/**
 * Enhanced field type inference that detects arrays properly
 */
function getFieldDefault(fieldName: string): unknown {
  // Known array fields should return arrays, not strings
  const arrayFields = [
    'gradeLevelsSupported', 'subjects', 'specialGroups', 'rolesNYCPS', 'rolesTL',
    'staffList', 'schedules', 'cycles', 'owners', 'schools', 'notes', 'experience',
    'assignedDistricts', 'adminLevel', 'events', 'sessionLinks'
  ];
  
  const defaultValue = arrayFields.includes(fieldName) ? [] : 
                      fieldName.includes('email') ? "" : "";
  
  // console.log(`🔧 Field "${fieldName}" gets default:`, defaultValue);
  return defaultValue;
}

/**
 * Convert enum to formatted definition string for AI prompt
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
 * Enum mappings - connects field names to actual imported enums
 */
const FIELD_TO_ENUM_MAP = {
  gradeLevelsSupported: { name: 'GradeLevels', enum: GradeLevels },
  subjects: { name: 'Subjects', enum: Subjects },
  specialGroups: { name: 'SpecialGroups', enum: SpecialGroups },
  rolesNYCPS: { name: 'RolesNYCPS', enum: RolesNYCPS },
  rolesTL: { name: 'RolesTL', enum: RolesTL },
  adminLevel: { name: 'AdminLevels', enum: AdminLevels },
  allowedPurpose: { name: 'AllowedPurposes', enum: AllowedPurposes },
  modeDone: { name: 'ModeDone', enum: ModeDone }
};

/**
 * Generate template from schema
 */
function createTemplate<T>(schema: z.ZodSchema<T>): Record<string, unknown> {
  const fields = getSchemaFields(schema);
  const template: Record<string, unknown> = {};
  
  fields.forEach(field => {
    template[field] = getFieldDefault(field);
  });
  
  return template;
}

/**
 * Generate enum definitions section for AI prompt
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
 * Generate basic field instructions
 */
function generateFieldInstructions(entityName: string): string {
  if (entityName === 'school') {
    return `CRITICAL REQUIREMENTS:
- schoolNumber: Official school identifier (REQUIRED - cannot be empty)
- district: School district name (REQUIRED - cannot be empty)  
- schoolName: Full school name (REQUIRED - cannot be empty)
- gradeLevelsSupported: Array of grade levels (can be empty array [])
- staffList: Array of staff IDs (MUST be empty array [])
- schedules: Array of schedule IDs (MUST be empty array [])
- cycles: Array of cycle IDs (MUST be empty array [])
- owners: Array of owner IDs (MUST be empty array [])
- address: Street address (can be empty string "")
- emoji: School emoji (can be empty string "")`;
  } else if (entityName === 'staff') {
    return `Instructions:
- IMPORTANT: Return an ARRAY of staff objects, even for single person
- staffName: Full name (required)
- email: Email address (required)
- gradeLevelsSupported: Array of grade level values from enum
- subjects: Array of subject values from enum
- rolesNYCPS: Array of role values from enum
- Arrays like schools/notes/experience: Leave empty []`;
  } else if (entityName === 'visits') {
    return `CRITICAL REQUIREMENTS:
- IMPORTANT: Return an ARRAY of visit objects, even for single visit
- date: Visit date in YYYY-MM-DD format (REQUIRED - cannot be empty)
- school: School ID (REQUIRED - will be set automatically by system)
- coach: Coach name or ID (REQUIRED - cannot be empty)
- gradeLevelsSupported: Array of grade levels (REQUIRED - can be empty array [])
- owners: Array of owner IDs (REQUIRED - can be empty array [])

OPTIONAL FIELDS (can be empty strings or omitted):
- cycleRef: Cycle reference
- allowedPurpose: Purpose of visit (use enum values if provided)
- modeDone: Mode of visit (use enum values if provided)
- events: Array of event objects (can be empty array [])
- sessionLinks: Array of session links (can be empty array [])

Monday.com integration fields (optional):
- mondayItemId, mondayBoardId, mondayItemName, mondayLastSyncedAt
- siteAddress, endDate`;
  }
  
  return '';
}

// Generate templates
export const SCHOOL_TEMPLATE = createTemplate(SchoolInputZodSchema);
export const STAFF_TEMPLATE = createTemplate(NYCPSStaffInputZodSchema);
export const VISIT_TEMPLATE = createVisitTemplate(); // Use manual template

// Get field lists for enum definitions
const schoolFields = getSchemaFields(SchoolInputZodSchema);
const staffFields = getSchemaFields(NYCPSStaffInputZodSchema);
const visitFields = Object.keys(VISIT_TEMPLATE); // Use manual template fields

export const AI_PROMPTS = {
  school: `Fill this JSON schema with school information. ALL fields are required, even if empty:

${JSON.stringify(SCHOOL_TEMPLATE, null, 2)}

${generateFieldInstructions('school')}

Return VALID JSON with ALL fields present, no explanation text.${generateEnumDefinitions(schoolFields)}`,

  staff: `Fill this JSON schema with staff information:

${JSON.stringify(STAFF_TEMPLATE, null, 2)}

${generateFieldInstructions('staff')}

Return only valid JSON, no explanation text${generateEnumDefinitions(staffFields)}`,

  visits: `Fill this JSON schema with visit information:

${JSON.stringify(VISIT_TEMPLATE, null, 2)}

${generateFieldInstructions('visits')}

Return only valid JSON, no explanation text${generateEnumDefinitions(visitFields)}`
}; 