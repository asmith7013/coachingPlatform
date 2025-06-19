import type { BaseDocument } from '@core-types/document';

/**
 * Generic Entity Lookup Utilities
 * 
 * Provides reusable functions for common entity operations like finding by ID,
 * getting display names, and checking existence. Works with any entity that
 * extends BaseDocument.
 */

/**
 * Generic entity lookup by ID
 * Works with any entity that has an _id field
 */
export function findEntityById<T extends Pick<BaseDocument, '_id'>>(
  entities: T[], 
  id: string
): T | undefined {
  return entities.find(entity => entity._id === id);
}

/**
 * Generic entity name getter with fallback
 * Works with entities that have common name fields
 * Checks fields in priority order: staffName > name > schoolName > title
 */
export function getEntityDisplayName<T extends Pick<BaseDocument, '_id'> & Partial<{
  staffName: string;
  name: string; 
  schoolName: string;
  title: string;
}>>(
  entities: T[], 
  id: string, 
  fallback = 'Unknown'
): string {
  const entity = findEntityById(entities, id);
  if (!entity) return fallback;
  
  // Check common name fields in priority order
  return entity.staffName || 
         entity.name || 
         entity.schoolName || 
         entity.title || 
         fallback;
}

