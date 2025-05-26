// src/lib/integrations/monday/mappers/utils/transformer.ts

import { EntityMappingConfig } from "@lib/integrations/monday/types/mapping";
import { TransformResult } from "@lib/integrations/monday/types/transform";
import { MondayColumn, MondayColumnValue } from "@lib/integrations/monday/types/board";
import { MondayItem } from "@lib/integrations/monday/types/board";

/**
 * Base mapper class with shared functionality for all entity mappers
 */
export class SchemaTransformer<T extends Record<string, unknown>> {
  protected config: EntityMappingConfig<T>;
  
  constructor(config: EntityMappingConfig<T>) {
    this.config = config;
  }
  
  /**
   * Helper function to create a mapping between Monday column titles and entity fields
   */
  protected createTitleMapping(): Record<string, keyof T> {
    const result: Record<string, keyof T> = {};
    
    // Iterate through the title mappings
    Object.entries(this.config.titleMappings).forEach(([fieldName, titles]) => {
      // For each title, add a mapping to the field name
      titles.forEach(title => {
        result[title] = fieldName as keyof T;
      });
    });
    
    return result;
  }
  
  /**
   * Map Monday.com columns to entity fields using configuration
   */
  mapMondayColumnsToEntityFields(
    mondayItem: MondayItem, 
    boardColumns: MondayColumn[]
  ): { 
    entityData: Partial<T>;
    missingFields: string[];
  } {
    // Initialize with basic Monday metadata
    const entityData = this.initializeEntityData(mondayItem);
    
    const missingFields: string[] = [];
    
    // Create a title-based mapping (column title -> entity field)
    const titleMapping = this.createTitleMapping();
    
    // Create maps for easier lookup
    const columnsByTitle: Record<string, MondayColumn> = {};
    boardColumns.forEach(col => {
      columnsByTitle[col.title] = col;
    });
    
    const valuesById: Record<string, MondayColumnValue> = {};
    mondayItem.column_values.forEach(val => {
      valuesById[val.id] = val;
    });
    
    // Process each board column
    boardColumns.forEach(column => {
      const fieldName = titleMapping[column.title];
      if (!fieldName) return; // Skip columns we don't care about
      
      const value = valuesById[column.id];
      if (!value || (!value.text && !value.value)) {
        // Missing required field
        if (this.config.requiredFields.includes(fieldName)) {
          missingFields.push(fieldName as string);
        }
        return;
      }
      
      // Apply the value to the field
      this.applyValueToField(entityData, fieldName, value, column);
    });
    
    // Run post-processing hooks
    this.postProcessEntityData();
    
    // Check for missing required fields
    this.config.requiredFields.forEach(field => {
      if (entityData[field] === undefined || 
          (Array.isArray(entityData[field]) && entityData[field].length === 0)) {
        // Only add if not already in the list
        if (!missingFields.includes(field as string)) {
          missingFields.push(field as string);
        }
      }
    });
    
    // Try to apply column ID mapping for fields still missing
    if (missingFields.length > 0) {
      this.handleFallbackMapping(entityData, valuesById, boardColumns, missingFields);
    }
    
    return { entityData, missingFields };
  }
  
  /**
   * Create a transform result compatible with the transform-service pattern
   */
  transformMondayItemToEntity(
    mondayItem: MondayItem, 
    boardColumns: MondayColumn[]
  ): TransformResult {
    const { entityData, missingFields } = this.mapMondayColumnsToEntityFields(mondayItem, boardColumns);
    
    // Determine overall validity
    const valid = missingFields.length === 0;
    
    return {
      transformed: entityData,
      valid,
      success: valid,
      missingRequired: missingFields,
      errors: missingFields.reduce((acc, field) => {
        acc[field] = `Required field '${field}' is missing`;
        return acc;
      }, {} as Record<string, string>)
    };
  }
  
  /**
   * Initialize entity data with basic Monday metadata
   * Can be overridden by subclasses to provide entity-specific initialization
   */
  protected initializeEntityData(mondayItem: MondayItem): Partial<T> {
    return {
      mondayItemId: mondayItem.id,
      mondayBoardId: mondayItem.board_id,
      mondayItemName: mondayItem.name,
      mondayLastSyncedAt: new Date().toISOString(),
    } as unknown as Partial<T>;
  }
  
  /**
   * Post-process entity data after initial mapping
   * Can be overridden by subclasses to provide entity-specific post-processing
   */
  protected postProcessEntityData(
    // entityData: Partial<T>
  ): void {
    // Default implementation does nothing
  }
  
  /**
   * Apply a value to a field based on field name and column type
   */
  protected applyValueToField(
    data: Partial<T>,
    field: keyof T,
    value: MondayColumnValue,
    column: MondayColumn
  ): void {
    // Use the transformer if available
    const transformer = this.config.valueTransformers[field];
    
    if (transformer) {
      // Apply the transformer function
      const transformedValue = transformer(value, column);
      
      if (Array.isArray(transformedValue) && Array.isArray(data[field])) {
        // For array fields, append items
        const existingArray = data[field] as unknown as unknown[];
        transformedValue.forEach(item => {
          if (!existingArray.includes(item)) {
            existingArray.push(item);
          }
        });
      } else {
        // Standard field assignment
        data[field] = transformedValue as unknown as T[keyof T];
      }
    } else {
      // Default to text for fields without a specific transformer
      (data as Record<string, unknown>)[field as string] = value.text || "";
    }
  }
  
  /**
   * Check if a field is missing or empty
   */
  protected isFieldMissing(
    data: Partial<T>,
    field: keyof T,
    missingFields: string[]
  ): boolean {
    // If it's in the missing fields list, it's definitely missing
    if (missingFields.includes(field as string)) return true;
    
    // Check if it's undefined or empty array
    return data[field] === undefined || 
      (Array.isArray(data[field]) && (data[field] as unknown[]).length === 0);
  }
  
  /**
   * Try to map fields using column IDs and types as a fallback
   */
  protected handleFallbackMapping(
    entityData: Partial<T>,
    valuesById: Record<string, MondayColumnValue>,
    boardColumns: MondayColumn[],
    missingFields: string[]
  ): void {
    // First try to match by column ID patterns
    Object.entries(valuesById).forEach(([colId, value]) => {
      // Skip if no value
      if (!value || (!value.text && !value.value)) return;
      
      // Try to find matching field by ID pattern
      let matchedField: keyof T | undefined;
      for (const [pattern, fieldName] of Object.entries(this.config.idPatternMappings)) {
        if (colId.toLowerCase().includes(pattern.toLowerCase())) {
          matchedField = fieldName;
          break;
        }
      }
      
      if (matchedField && this.isFieldMissing(entityData, matchedField, missingFields)) {
        // Find the column definition to get its type
        const column = boardColumns.find(col => col.id === colId);
        if (!column) return;
        
        // Process based on field name and column type
        this.applyValueToField(entityData, matchedField, value, column);
        
        // Remove from missing fields if set successfully
        if (!this.isFieldMissing(entityData, matchedField, [])) {
          const index = missingFields.indexOf(matchedField as string);
          if (index >= 0) {
            missingFields.splice(index, 1);
          }
        }
      }
    });
    
    // If still missing fields, try type-based mapping as last resort
    if (missingFields.length > 0) {
      boardColumns.forEach(column => {
        const potentialFields = this.config.typeMappings[column.type];
        if (!potentialFields) return;
        
        // Find the first missing field that matches this type
        const fieldToFill = potentialFields.find(field => 
          this.isFieldMissing(entityData, field, missingFields)
        );
        
        if (fieldToFill) {
          const value = valuesById[column.id];
          if (!value || (!value.text && !value.value)) return;
          
          this.applyValueToField(entityData, fieldToFill, value, column);
          
          // Remove from missing fields if set successfully
          if (!this.isFieldMissing(entityData, fieldToFill, [])) {
            const index = missingFields.indexOf(fieldToFill as string);
            if (index >= 0) {
              missingFields.splice(index, 1);
            }
          }
        }
      });
    }
  }
} 