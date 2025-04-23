export function sanitizeSortBy(
  sortBy: string | undefined,
  allowedFields: string[] = []
): string {
  // Default to updatedAt if no sortBy provided
  if (!sortBy) return 'updatedAt';
  
  // Remove any direction indicators from the sortBy field
  const cleanSortBy = sortBy.replace(/^-/, '');
  
  // Check against allowed fields if provided
  if (allowedFields.length > 0 && !allowedFields.includes(cleanSortBy)) {
    return 'updatedAt';
  }
  
  // Return the sanitized field name
  return cleanSortBy;
} 