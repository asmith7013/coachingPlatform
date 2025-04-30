import { z } from "zod";
import { FIELD_MAPPINGS } from "./field-mappings";
import { MondayItem, TransformResult, ValidationResult } from "@/lib/types/domain/monday";
import { VisitInput, VisitInputZodSchema } from "@zod-schema/visits/visit";
import { 
  ModeDoneZod, 
  AllowedPurposeZod, 
  GradeLevelsSupportedZod 
} from "@enums";
import { findAllDuplicateVisits } from "./duplicate-checker";

/**
 * Validates a transformed Visit from Monday.com data
 * Returns detailed validation information including field-specific errors
 */
export function validateTransformedVisit(visit: Partial<VisitInput>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  let isValid = true;
  
  // Validate required fields
  for (const [_key, mapping] of Object.entries(FIELD_MAPPINGS)) {
    if (mapping.required) {
      const fieldName = mapping.field as keyof VisitInput;
      const fieldValue = visit[fieldName];
      
      // Check if field is missing or empty
      if (fieldValue === undefined || fieldValue === null || 
          (Array.isArray(fieldValue) && fieldValue.length === 0) ||
          (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        errors[mapping.field] = mapping.errorMessage || `${mapping.field} is required`;
        isValid = false;
      }
    }
  }
  
  // Field-specific validation using validators from field mappings
  for (const [_key, mapping] of Object.entries(FIELD_MAPPINGS)) {
    const fieldName = mapping.field as keyof VisitInput;
    const fieldValue = visit[fieldName];
    
    // Skip if field is not present and not required
    if ((fieldValue === undefined || fieldValue === null) && !mapping.required) {
      continue;
    }
    
    // Validate using field's validator if provided
    if (mapping.validator && fieldValue !== undefined) {
      const validationResult = mapping.validator.safeParse(fieldValue);
      
      if (!validationResult.success) {
        const zodError = validationResult.error;
        // Get the first error message
        const errorMessage = zodError.errors[0]?.message || mapping.errorMessage || `Invalid ${mapping.field}`;
        errors[mapping.field] = errorMessage;
        isValid = false;
      }
    }
  }
  
  // Type-specific validation
  if (visit.modeDone && !ModeDoneZod.safeParse(visit.modeDone).success) {
    errors.modeDone = "Invalid mode value. Must be one of: " + 
      Object.values(ModeDoneZod.options).join(", ");
    isValid = false;
  }
  
  if (visit.allowedPurpose && !AllowedPurposeZod.safeParse(visit.allowedPurpose).success) {
    errors.allowedPurpose = "Invalid purpose value. Must be one of: " + 
      Object.values(AllowedPurposeZod.options).join(", ");
    isValid = false;
  }
  
  // Validate grade levels
  if (visit.gradeLevelsSupported && Array.isArray(visit.gradeLevelsSupported)) {
    const invalidGrades = visit.gradeLevelsSupported.filter(
      grade => !GradeLevelsSupportedZod.options.includes(grade as string)
    );
    
    if (invalidGrades.length > 0) {
      errors.gradeLevelsSupported = `Invalid grade levels: ${invalidGrades.join(", ")}. Valid options are: ${GradeLevelsSupportedZod.options.join(", ")}`;
      isValid = false;
    }
  }
  
  // Add data quality warnings (not errors)
  // These don't affect validity but help users improve data quality
  if (!visit.siteAddress && visit.date) {
    warnings.siteAddress = "Consider adding site address for better documentation";
  }
  
  // Validate complete document against Zod schema
  if (isValid) {
    try {
      // Final schema validation to catch any missed issues
      VisitInputZodSchema.parse(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const issue of error.errors) {
          const field = issue.path.join('.');
          errors[field] = issue.message;
        }
        isValid = false;
      } else if (error instanceof Error) {
        errors._general = error.message;
        isValid = false;
      }
    }
  }
  
  return {
    isValid,
    errors,
    warnings,
    missingRequired: Object.keys(errors).filter(field => 
      Object.values(FIELD_MAPPINGS)
        .some(mapping => mapping.field === field && mapping.required)
    ),
  };
}

/**
 * Enhanced transformation with detailed validation
 */
export async function transformAndValidateMondayItem(
  mondayItem: MondayItem, 
  columnMappings: Record<string, string>
): Promise<TransformResult> {
  // Initialize with default values
  const transformed: Partial<VisitInput> = {
    mondayItemId: mondayItem.id,
    mondayBoardId: mondayItem.board_id,
    mondayItemName: mondayItem.name,
    mondayLastSyncedAt: new Date(),
    owners: [], // Will be populated from coach if found
  };

  const columnErrors: Record<string, string> = {};
  
  // Process each column with a mapping
  for (const column of mondayItem.column_values) {
    // Skip columns without mappings
    const fieldName = columnMappings[column.id];
    if (!fieldName) continue;
    
    // Find the mapping config
    const mapping = Object.values(FIELD_MAPPINGS)
      .find(m => m.field === fieldName);
    
    if (!mapping) continue;
    
    try {
      // Extract text value
      const textValue = column.text || '';
      
      if (textValue.trim() === '' && mapping.required) {
        columnErrors[fieldName] = `${fieldName} is required`;
        continue;
      }
      
      // Apply transformation
      const value = mapping.transform 
        ? await mapping.transform(textValue)
        : textValue;
      
      // @ts-expect-error - Complex mapping requires type assertion
      transformed[fieldName] = value;
    } catch (error) {
      columnErrors[fieldName] = error instanceof Error 
        ? error.message 
        : `Error processing ${fieldName}`;
    }
  }
  
  // Validate the transformed object
  const validation = validateTransformedVisit(transformed);
  
  // Merge column errors with validation errors
  const errors = { ...columnErrors, ...validation.errors };
  
  // Determine if it's a valid visit
  const valid = Object.keys(errors).length === 0;
  
  // Set owners from coach if available
  if (transformed.coach && !transformed.owners?.length) {
    transformed.owners = [transformed.coach];
  }
  
  return {
    transformed,
    valid,
    success: valid,
    missingRequired: validation.missingRequired,
    errors,
    warnings: validation.warnings,
  };
}

/**
 * Detect duplicate visits in the database
 */
export async function findDuplicateVisits(
  visits: Array<Partial<VisitInput>>
): Promise<Record<string, string>> {
  return findAllDuplicateVisits(visits);
} 