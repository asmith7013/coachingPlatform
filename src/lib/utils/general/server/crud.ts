import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export async function createItem<T>(
  model: mongoose.Model<unknown>,
  schema: z.ZodType<T>,
  data: unknown,
  revalidatePaths: string[] = []
) {
  try {
    // Validate data against schema
    const validatedData = schema.parse(data);
    
    // Create the item in the database
    const item = await model.create(validatedData);
    
    // Revalidate paths if provided
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return {
      success: true,
      data: item
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function updateItem<T>(
  model: mongoose.Model<unknown>,
  schema: z.ZodType<T>,
  id: string,
  data: unknown,
  revalidatePaths: string[] = []
) {
  try {
    // Validate data against schema
    const validatedData = schema.parse(data);
    
    // Update the item in the database
    const item = await model.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );
    
    if (!item) {
      return {
        success: false,
        error: 'Item not found'
      };
    }
    
    // Revalidate paths if provided
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return {
      success: true,
      data: item
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function deleteItem(
  model: mongoose.Model<unknown>,
  id: string,
  revalidatePaths: string[] = []
) {
  try {
    // Delete the item from the database
    const result = await model.findByIdAndDelete(id);
    
    if (!result) {
      return {
        success: false,
        error: 'Item not found'
      };
    }
    
    // Revalidate paths if provided
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return {
      success: true,
      data: { _id: id }
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 