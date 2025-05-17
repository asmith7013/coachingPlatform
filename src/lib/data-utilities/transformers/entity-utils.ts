// src/lib/data-utilities/transformers/entity-utils.ts
import { Types } from 'mongoose';
import { BaseDocument } from '@core-types/document';

/**
 * Gets the ID from an entity, checking both _id and id properties
 * Converts ObjectId to string if needed
 * 
 * @param entity - The entity to get the ID from
 * @returns The entity ID as a string or undefined
 */
export function getEntityId(entity: BaseDocument | null | undefined): string | undefined {
  if (!entity) return undefined;
  
  // Handle _id field
  if (entity._id) {
    // Convert ObjectId to string if needed
    return entity._id instanceof Types.ObjectId 
      ? entity._id.toString() 
      : typeof entity._id === 'string' 
        ? entity._id 
        : undefined;
  }
  
  // Fallback to id field
  return typeof entity.id === 'string' ? entity.id : undefined;
}

/**
 * Compares entity IDs, handling both string and ObjectId types
 * 
 * @param entityId - The entity ID (might be ObjectId or string)
 * @param targetId - The target ID to compare against (string)
 * @returns True if IDs match
 */
export function matchesId(entityId: unknown, targetId: string): boolean {
  if (!entityId) return false;
  
  // Handle ObjectId
  if (entityId instanceof Types.ObjectId) {
    return entityId.toString() === targetId;
  }
  
  // Handle string
  return entityId === targetId;
}