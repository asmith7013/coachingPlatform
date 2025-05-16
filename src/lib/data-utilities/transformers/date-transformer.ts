/**
 * Transforms string dates to Date objects for specific fields
 * This maintains type safety while ensuring consistent date handling
 */
export function transformDateFields<T extends { createdAt?: string | Date; updatedAt?: string | Date }>(
  obj: T
): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  // Transform standard date fields
  if (obj.createdAt) result.createdAt = new Date(obj.createdAt);
  if (obj.updatedAt) result.updatedAt = new Date(obj.updatedAt);
  
  return result;
}

/**
 * Applies date transformation to arrays of objects
 */
export function transformDateFieldsArray<T extends { createdAt?: string | Date; updatedAt?: string | Date }>(
  items: T[]
): T[] {
  if (!items || !Array.isArray(items)) return items || [];
  return items.map(transformDateFields);
} 