import { visitFieldMappings } from "./field-mappings";
import { VisitInput } from "@/lib/data-schema/zod-schema/visits/visit";
import { parseOrThrow } from "@/lib/data-utilities/transformers/parse";
import { VisitInputZodSchema } from "@/lib/data-schema/zod-schema/visits/visit";
import { extractTextFromMondayValue } from "./monday-utils";

export type TransformResult = {
  transformed: Partial<VisitInput>;
  valid: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
};

interface MondayColumnValue {
  id: string;
  title: string;
  value: string | null;
  text: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  board_id?: string;
  column_values: MondayColumnValue[];
}

export async function transformMondayItemToVisit(mondayItem: MondayItem): Promise<TransformResult> {
  const transformed: Partial<VisitInput> = {
    mondayItemId: mondayItem.id,
    mondayBoardId: mondayItem.board_id,
    mondayItemName: mondayItem.name,
    mondayLastSyncedAt: new Date(),
    owners: [], // Default owners - could be from settings or current user
  };
  
  const missingRequired: string[] = [];
  const errors: Record<string, string> = {};
  
  // Process each field mapping
  for (const [mondayField, mapping] of Object.entries(visitFieldMappings)) {
    try {
      const columnValue = mondayItem.column_values.find(
        (col: MondayColumnValue) => col.id === mondayField || col.title === mondayField
      );
      
      if (!columnValue || !columnValue.value) {
        if (mapping.required) {
          missingRequired.push(mapping.field);
        }
        continue;
      }
      
      // Extract the text value from Monday's format
      const textValue = extractTextFromMondayValue(columnValue.value);
      
      // Apply transformation
      const value = mapping.transform 
        ? await mapping.transform(textValue)
        : textValue;
        
      // @ts-expect-error Complex mapping of different field types requires type assertion
      transformed[mapping.field as keyof VisitInput] = value;
    } catch (error) {
      errors[mapping.field] = (error as Error).message;
    }
  }
  
  // Validate against schema
  let valid = true;
  try {
    if (missingRequired.length === 0) {
      parseOrThrow(VisitInputZodSchema, transformed);
    } else {
      valid = false;
    }
  } catch (error) {
    valid = false;
    const zodError = error as { errors?: Array<{ path: string[]; message: string }> };
    if (zodError.errors) {
      zodError.errors.forEach((err) => {
        errors[err.path.join('.')] = err.message;
      });
    }
  }
  
  return {
    transformed,
    valid,
    missingRequired,
    errors
  };
} 