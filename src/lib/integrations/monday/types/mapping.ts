import {
  MondayColumn,
  MondayColumnValue,
} from "@lib/integrations/monday/types/board";
import { z } from "zod";

/**
 * Function type for transforming Monday column values to entity field values
 */
export type ValueTransformer<T> = (
  value: MondayColumnValue,
  column?: MondayColumn,
) => T;

/**
 * Generic type for entity mapping configuration
 */
export interface EntityMappingConfig<T> {
  // Maps entity field names to possible Monday column titles
  titleMappings: Record<keyof T, string[]>;

  // Maps Monday column types to possible entity fields
  typeMappings: Record<string, Array<keyof T>>;

  // Maps column ID patterns to entity fields
  idPatternMappings: Record<string, keyof T>;

  // Field-specific value transformers
  valueTransformers: Partial<Record<keyof T, ValueTransformer<T>>>;

  // Required fields for validation
  requiredFields: Array<keyof T>;
}

/**
 * Monday to Visit mapping field definition
 */
export interface MondayFieldMapping {
  field: string;
  required: boolean;
  columnTypes?: string[];
  validator?: z.ZodType<unknown>;
  transform?: (value: string) => Promise<unknown> | unknown;
  errorMessage?: string;
}
