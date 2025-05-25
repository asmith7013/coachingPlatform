// src/lib/data-utilities/transformers/entity-utils.ts
import { BaseDocument } from '@core-types/document';
import { transformDocument, isMongoDocument } from '@/lib/data-utilities/transformers/core/document';

/**
 * Gets the ID from an entity, using the new transformer system for consistency
 * Handles both raw MongoDB documents and already-transformed entities
 */
export function getEntityId(entity: BaseDocument | null | undefined): string | undefined {
  if (!entity) return undefined;
  
  // If it's a MongoDB document, transform it first to ensure consistent ID handling
  const processedEntity = isMongoDocument(entity) 
    ? transformDocument(entity) as BaseDocument
    : entity;
  
  // After transformation, prefer id field (guaranteed string), fallback to _id
  return processedEntity.id || processedEntity._id;
}

/**
 * Compares entity IDs using the new transformer system for consistent comparison
 */
export function matchesId(entityId: unknown, targetId: string): boolean {
  if (!targetId) return false;
  
  // Extract ID using the updated getEntityId function
  const extractedId = getEntityId(entityId as BaseDocument);
  return extractedId === targetId;
}