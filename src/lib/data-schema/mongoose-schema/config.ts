import { MongooseTransformDocument } from '@/lib/types/core/document';

/**
 * Safe transform for TypeGoose documents
 */
function safeTransform(_: unknown, ret: MongooseTransformDocument): Record<string, unknown> {
  // Create a new object to avoid modifying the original
  const result: Record<string, unknown> = { ...ret };
  
  // Safely convert _id to string and add id field
  if (result._id) {
    const idStr = typeof result._id === 'string' 
      ? result._id 
      : result._id.toString();
    
    result._id = idStr;
    result.id = idStr;
  }
  
  // Remove __v (version) field
  if ('__v' in result) {
    delete result.__v;
  }
  
  // Safely convert date fields
  if (result.createdAt instanceof Date) {
    result.createdAt = result.createdAt.toISOString();
  }
  
  if (result.updatedAt instanceof Date) {
    result.updatedAt = result.updatedAt.toISOString();
  }
  
  return result;
}

export const defaultModelOptions = {
  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: safeTransform
    },
    toObject: {
      virtuals: true,
      transform: safeTransform // Use the same transform for consistency
    }
  }
};