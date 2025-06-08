// Simple replacement for over-engineered mongo document transformer
// ObjectId conversion is now handled at the model layer

/**
 * Check if an object is a MongoDB document
 * Simplified version - models handle ObjectId conversion automatically
 */
export function isMongoDocument(obj: unknown): boolean {
  return obj !== null && typeof obj === 'object' && '_id' in (obj as object);
}

/**
 * Simple document processor - no longer needed as models handle conversion
 */
export function processMongoDocument<T>(doc: T): T {
  return doc; // Models handle ObjectId conversion via toJSON
} 