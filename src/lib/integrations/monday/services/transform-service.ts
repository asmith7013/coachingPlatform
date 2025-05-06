import { 
  MondayItem, 
  MondayColumnValue, 
  TransformResult,
  MondayFieldMapping,
} from '@api-monday/types';
import { FIELD_MAPPERS } from '@api-monday/config';
import { Visit, VisitInput, VisitImportZodSchema, VisitInputZodSchema } from '@zod-schema/visits/visit';
import { extractTextFromMondayValue } from '@api-monday/utils/monday-utils';
import { z } from 'zod';

/**
 * Transform a Monday.com item into a Visit entity
 * 
 * Business logic for mapping Monday.com column values to Visit fields,
 * with validation and error reporting.
 * 
 * @param mondayItem The Monday.com item to transform
 * @returns Transformation result with validation info
 */
export async function transformMondayItemToVisit(mondayItem: MondayItem): Promise<TransformResult> {
  const transformed: Partial<VisitInput> = {
    mondayItemId: mondayItem.id,
    mondayBoardId: mondayItem.board_id,
    mondayItemName: mondayItem.name,
    mondayLastSyncedAt: new Date().toISOString(),
    owners: [] as string[], // Default owners - could be from settings or current user
  };
  
  const missingRequired: string[] = [];
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const requiredForFinalValidation: string[] = [];
  
  // Process each field mapping
  for (const [mondayField, mapping] of Object.entries(FIELD_MAPPERS)) {
    try {
      const typedMapping = mapping as MondayFieldMapping;
      const columnValue = mondayItem.column_values.find(
        (col: MondayColumnValue) => col.id === mondayField || col.title === mondayField
      );
      
      if (!columnValue || !columnValue.value) {
        if (typedMapping.required) {
          missingRequired.push(typedMapping.field);
        }
        continue;
      }
      
      // Extract the text value from Monday's format
      const textValue = extractTextFromMondayValue(columnValue.value);
      
      // Apply transformation - separate transformation from assignment
      const fieldName = typedMapping.field;
      let transformedValue;
      
      if (typedMapping.transform) {
        transformedValue = await typedMapping.transform(textValue);
      } else {
        transformedValue = textValue;
      }
      
      // Type-safe assignment using indexed accessor pattern
      // This isolates the type assertion to just this line
      (transformed as Record<string, unknown>)[fieldName] = transformedValue;
        
    } catch (error) {
      errors[(mapping as MondayFieldMapping).field] = (error as Error).message;
    }
  }
  
  // Auto-assign owners from coach if coach is found but owners is empty
  if (transformed.coach && 
      (!transformed.owners || 
       (Array.isArray(transformed.owners) && transformed.owners.length === 0))) {
    // Ensure coach is treated as a string
    const coachId = typeof transformed.coach === 'string' 
      ? transformed.coach 
      : String(transformed.coach);
    
    transformed.owners = [coachId] as string[];
    
    // Remove coach from missing required fields if it was there
    const ownerIndex = missingRequired.indexOf('owners');
    if (ownerIndex !== -1) {
      missingRequired.splice(ownerIndex, 1);
    }
    
    // Remove any errors related to the owners field
    if (errors.owners) {
      delete errors.owners;
    }
  }
  
  // First validation: Check against import schema (relaxed)
  let validForImport = true;
  try {
    // Use the import schema which makes owners optional
    VisitImportZodSchema.parse(transformed);
  } catch (validationError) {
    validForImport = false;
    
    // Add validation errors to the errors object
    if (validationError instanceof z.ZodError) {
      validationError.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
    }
  }
  
  // Second validation: Check what's missing for final validation
  try {
    VisitInputZodSchema.parse(transformed);
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      validationError.errors.forEach((err) => {
        const field = err.path.join('.');
        // Only add to requiredForFinalValidation if not already in errors
        // to avoid duplicating error messaging
        if (!errors[field]) {
          requiredForFinalValidation.push(field);
        }
      });
    }
  }
  
  return {
    transformed,
    valid: validForImport,
    success: validForImport && requiredForFinalValidation.length === 0 && Object.keys(errors).length === 0,
    missingRequired,
    errors,
    warnings,
    requiredForFinalValidation
  };
}

/**
 * Transform a Visit entity into Monday.com column values
 * 
 * Business logic for mapping Visit fields to Monday.com column values,
 * using the reverse of the field mappings configuration.
 * 
 * @param visit The Visit entity to transform
 * @returns Record of Monday column values suitable for the Monday.com API
 */
export function transformVisitToMondayItem(visit: Visit): Record<string, unknown> {
  const mondayValues: Record<string, unknown> = {};
  
  // Create a reverse mapping from Visit fields to Monday column IDs
  const reverseMapping: Record<string, string> = {};
  const reverseTransformers: Record<string, ((value: unknown) => unknown) | undefined> = {};
  
  // Build reverse mapping from the FIELD_MAPPERS configuration
  for (const [mondayField, mapping] of Object.entries(FIELD_MAPPERS)) {
    const typedMapping = mapping as MondayFieldMapping;
    reverseMapping[typedMapping.field] = mondayField;
    
    // Store the reverse transformer if needed
    if (typedMapping.transform) {
      // Note: We don't actually call the transform function here
      // as it would require implementing custom reverse transformers
      // This is a placeholder for fields that need special handling
      reverseTransformers[typedMapping.field] = undefined;
    }
  }
  
  // Apply the mapping for each visit field that has a corresponding Monday column
  for (const [fieldName, fieldValue] of Object.entries(visit)) {
    // Skip null/undefined values and special fields
    if (fieldValue === null || fieldValue === undefined || 
        fieldName === '_id' || fieldName === 'createdAt' || fieldName === 'updatedAt' ||
        fieldName.startsWith('monday')) { // Skip monday-specific fields
      continue;
    }
    
    // Get the Monday column ID for this field
    const mondayColumnId = reverseMapping[fieldName];
    if (!mondayColumnId) {
      continue; // Skip fields without a Monday mapping
    }
    
    // Format date fields if needed
    if (fieldName === 'date' && typeof fieldValue === 'string') {
      // For date columns, Monday often expects a specific format
      mondayValues[mondayColumnId] = { date: fieldValue };
      continue;
    }
    
    // Special handling for different types of values
    if (Array.isArray(fieldValue)) {
      // For person columns (like owners or staff)
      if (fieldName === 'owners' || fieldName === 'staff') {
        // Monday expects an array of IDs for person columns
        mondayValues[mondayColumnId] = { 
          personsAndTeams: fieldValue.map(id => ({ id: String(id) }))
        };
      } else {
        // For other arrays, join with commas
        mondayValues[mondayColumnId] = fieldValue.join(', ');
      }
    } else if (typeof fieldValue === 'object') {
      // Handle object values - convert to Monday's expected format
      mondayValues[mondayColumnId] = JSON.stringify(fieldValue);
    } else {
      // Handle primitive values based on field type
      
      // Handle specific field types that need custom formatting
      // This should be expanded based on Monday column types
      if (fieldName === 'coach') {
        // Assuming coach is a person column expecting an ID
        mondayValues[mondayColumnId] = { 
          personsAndTeams: [{ id: String(fieldValue) }]
        };
      } else if (fieldName === 'school') {
        // Assuming school might be a dropdown or similar
        mondayValues[mondayColumnId] = { 
          labels: [{ name: String(fieldValue) }]
        };
      } else {
        // Default case - use the value directly
        mondayValues[mondayColumnId] = fieldValue;
      }
    }
  }
  
  return mondayValues;
}
