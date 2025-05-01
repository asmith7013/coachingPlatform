import { FIELD_MAPPERS } from "./field-mappings";
import { VisitInput, VisitImportZodSchema, VisitInputZodSchema } from "@/lib/data-schema/zod-schema/visits/visit";
import { extractTextFromMondayValue } from "./monday-utils";
import { 
  MondayItem, 
  MondayColumnValue, 
  TransformResult,
  MondayFieldMapping 
} from "@api-integrations/monday/types";
import { z } from "zod";

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
      
      // Apply transformation
      const value = typedMapping.transform 
        ? await typedMapping.transform(textValue)
        : textValue;
        
      transformed[typedMapping.field as keyof VisitInput] = value as any;
        
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
    requiredForFinalValidation
  };
} 