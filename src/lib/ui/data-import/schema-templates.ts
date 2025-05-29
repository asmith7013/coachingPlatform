import { z } from 'zod';
import { SchoolInputZodSchema } from '@schema/zod-schema/core/school';
import { NYCPSStaffInputZodSchema } from '@schema/zod-schema/core/staff';

// Type definitions for Zod schema internals
interface ZodTypeDef {
  typeName: string;
  type?: ZodTypeDef;
  values?: unknown[];
}

interface ZodSchemaWithShape {
  _def: {
    shape: Record<string, { _def: ZodTypeDef }>;
  };
}

/**
 * Generate a template object from a Zod schema with proper type information
 */
function generateTemplateFromSchema<T>(schema: z.ZodSchema<T>): Record<string, unknown> {
  const schemaWithShape = schema as unknown as ZodSchemaWithShape;
  const shape = schemaWithShape._def?.shape;
  if (!shape) return {};
  
  const template: Record<string, unknown> = {};
  
  for (const [key, zodType] of Object.entries(shape)) {
    const def = zodType._def;
    
    if (def?.typeName === 'ZodArray') {
      template[key] = [];
    } else if (def?.typeName === 'ZodString') {
      template[key] = "";
    } else if (def?.typeName === 'ZodNumber') {
      template[key] = 0;
    } else if (def?.typeName === 'ZodBoolean') {
      template[key] = false;
    } else if (def?.typeName === 'ZodOptional') {
      // For optional fields, we can skip or set to undefined
      template[key] = undefined;
    } else {
      template[key] = null;
    }
  }
  
  return template;
}

/**
 * Generate AI prompt instructions from schema
 */
function generateSchemaInstructions<T>(schema: z.ZodSchema<T>, entityName: string): string {
  const schemaWithShape = schema as unknown as ZodSchemaWithShape;
  const shape = schemaWithShape._def?.shape;
  const instructions: string[] = [];
  
  for (const [key, zodType] of Object.entries(shape)) {
    const def = zodType._def;
    
    if (def?.typeName === 'ZodArray' && def?.type?.values) {
      // Enum array
      const enumValues = def.type.values;
      instructions.push(`- For ${key}: use exact values from ${JSON.stringify(enumValues)}`);
    } else if (def?.typeName === 'ZodEnum' && def.values) {
      const enumValues = def.values;
      instructions.push(`- For ${key}: use one of ${JSON.stringify(enumValues)}`);
    }
  }
  
  return `Fill this JSON schema with ${entityName} information:

${JSON.stringify(generateTemplateFromSchema(schema), null, 2)}

Instructions:
${instructions.join('\n')}
- Return only valid JSON, no explanation text`;
}

// Export templates and instructions
export const SCHOOL_TEMPLATE = generateTemplateFromSchema(SchoolInputZodSchema);
export const STAFF_TEMPLATE = generateTemplateFromSchema(NYCPSStaffInputZodSchema);

export const AI_PROMPTS = {
  school: generateSchemaInstructions(SchoolInputZodSchema, 'school'),
  staff: generateSchemaInstructions(NYCPSStaffInputZodSchema, 'staff members (return as array)')
}; 