import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export async function bulkUploadToDB<T>(
  data: unknown[],
  model: mongoose.Model<unknown>,
  schema: z.ZodType<T>,
  revalidatePaths: string[] = []
) {
  // Track validation and insertion results
  const results = {
    success: false,
    total: data.length,
    valid: 0,
    invalid: 0,
    inserted: 0,
    errors: [] as { index: number; error: string }[],
    items: [] as unknown[]
  };
  
  // Validate each item
  const validItems = data.map((item, index) => {
    try {
      const validItem = schema.parse(item);
      results.valid++;
      return validItem;
    } catch (error) {
      results.invalid++;
      results.errors.push({ 
        index, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }).filter(Boolean) as T[];
  
  if (validItems.length === 0) {
    return {
      ...results,
      message: 'No valid items to insert'
    };
  }
  
  try {
    // Insert valid items
    const inserted = await model.insertMany(validItems);
    results.inserted = inserted.length;
    results.items = inserted;
    results.success = results.inserted > 0;
    
    // Revalidate paths if provided
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return {
      ...results,
      message: `Successfully inserted ${results.inserted} out of ${results.total} items`
    };
  } catch (error) {
    return {
      ...results,
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
} 