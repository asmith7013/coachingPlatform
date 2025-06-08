// Simple replacement for over-engineered transformation service
// This maintains compatibility while transitioning to direct data usage

import { ZodType } from "zod";
import { sanitizeDocument, sanitizeDocuments } from "@/lib/api/responses/formatters";

export interface TransformationServiceConfig {
  schema: ZodType<unknown>;
  entityName?: string;
  entityType?: string;
  handleDates?: boolean;
  errorContext?: string;
}

/**
 * Simple transformation service that just sanitizes documents
 * Replaces the over-engineered transformation system
 */
export function createTransformationService<T>(_config: TransformationServiceConfig) {
  return {
    transformData: (data: T[]): T[] => {
      return sanitizeDocuments(data);
    },
    transformSingle: (item: T): T | null => {
      if (!item) return null;
      return sanitizeDocument(item);
    },
    // Compatibility method - no longer wraps server actions
    wrapServerActions: (actions: Record<string, unknown>) => actions
  };
}

// Backwards compatibility export
export { createTransformationService as createTransformService }; 