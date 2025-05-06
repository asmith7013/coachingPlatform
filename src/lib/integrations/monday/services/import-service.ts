import { 
    ImportItem,     
    ImportPreview, 
    ImportResult, 
    // TransformResult 
  } from '@api-monday/types';
  import { withDbConnection } from '@data-server/db/ensure-connection';
  import { VisitModel } from '@mongoose-schema/visits/visit.model';
  import { VisitInputZodSchema, VisitImportZodSchema } from '@zod-schema/visits/visit';
  import { fetchMondayItems, fetchMondayItemById } from '@api-monday/client';
  import { transformMondayItemToVisit } from '@api-monday/services/transform-service';
  import { shouldImportItemWithStatus } from '@api-monday/utils/monday-utils';
//   import { revalidatePath } from 'next/cache';
  
  /**
   * Find potential visits to import from a Monday.com board
   * 
   * Business logic for identifying and transforming Monday.com items
   * that can be imported as visits.
   * 
   * @param boardId The Monday.com board ID to search
   * @returns Array of import previews with transformation results
   */
  export async function findPotentialVisitsToImport(boardId: string): Promise<ImportPreview[]> {
    try {
      // Fetch items from the repository layer
      const mondayItems = await fetchMondayItems(boardId);
      const previews: ImportPreview[] = [];
      
      await withDbConnection(async () => {
        for (const item of mondayItems) {
          // Skip items that don't have statuses we want to import
          if (!shouldImportItemWithStatus(item.state)) {
            continue;
          }
          
          // Check if already imported by mondayItemId
          const existingVisit = await VisitModel.findOne({ mondayItemId: item.id });
          
          // Transform the item with validation
          const transformResult = await transformMondayItemToVisit(item);
          
          // Add to preview list
          previews.push({
            original: item as unknown as Record<string, unknown>,
            transformed: transformResult.transformed,
            valid: transformResult.valid,
            existingItem: existingVisit?.toObject() || undefined,
            isDuplicate: !!existingVisit,
            missingRequired: transformResult.missingRequired,
            errors: transformResult.errors,
            requiredForFinalValidation: transformResult.requiredForFinalValidation
          });
        }
      });
      
      return previews;
    } catch (error) {
      console.error("Error finding potential visits to import:", error);
      throw error;
    }
  }
  
  /**
   * Import selected visits from Monday.com
   * 
   * Business logic for importing selected Monday.com items as visits,
   * handling validation, transformation, and database operations.
   * 
   * @param selectedItems Items to import (string IDs or ImportItem objects with completion data)
   * @returns Import result with success/failure information
   */
  export async function importSelectedVisits(
    selectedItems: ImportItem[] | string[]
  ): Promise<ImportResult> {
    const errors: Record<string, string> = {};
    let imported = 0;
    
    await withDbConnection(async () => {
      // Handle both string[] and ImportItem[] formats
      const itemsToProcess = Array.isArray(selectedItems) && selectedItems.length > 0 && typeof selectedItems[0] === 'string'
        ? (selectedItems as string[]).map(id => ({ id }))
        : (selectedItems as ImportItem[]);
      
      for (const item of itemsToProcess) {
        try {
          // Get the Monday item from repository
          const mondayItem = await fetchMondayItemById(item.id);
          
          // Transform to Visit - this includes auto-assigned owners from coach
          const transformResult = await transformMondayItemToVisit(mondayItem);
          
          if (!transformResult.valid) {
            errors[item.id] = "Invalid item data after transformation";
            continue;
          }
          
          const transformed = transformResult.transformed;
          
          // Apply owner from selection if provided - this overrides any auto-assigned owners
          if ('ownerId' in item && item.ownerId) {
            transformed.owners = [item.ownerId];
          }
          
          // Apply completed data if provided - adds any fields filled in via form
          if ('completeData' in item && item.completeData) {
            Object.assign(transformed, item.completeData);
          }
          
          // Validate with appropriate schema
          let validatedData;
          const fullValidation = VisitInputZodSchema.safeParse(transformed);
          
          if (fullValidation.success) {
            validatedData = fullValidation.data;
          } else {
            // Fall back to import schema for partial imports
            const importValidation = VisitImportZodSchema.safeParse(transformed);
            if (!importValidation.success) {
              errors[item.id] = "Invalid item data after transformation";
              continue;
            }
            validatedData = transformed;
          }
          
          // Create the Visit in MongoDB
          await VisitModel.create(validatedData);
          imported++;
        } catch (error) {
          if (error instanceof Error) {
            errors[item.id] = error.message;
          } else {
            errors[item.id] = 'Unknown error occurred';
          }
        }
      }
    });
    
    const hasErrors = Object.keys(errors).length > 0;
    
    return {
      success: imported > 0,
      imported,
      errors,
      message: hasErrors 
        ? `Imported ${imported} visits with ${Object.keys(errors).length} errors` 
        : `Successfully imported ${imported} visits`
    };
  }