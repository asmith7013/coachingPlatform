/**
 * Simple document sanitization for API responses
 * Handles the basic case of ensuring _id is a string and adding id field
 */
export function sanitizeDocument<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  
  const sanitized = { ...doc };
  
  // Handle _id conversion (Mongoose models should already do this via toJSON)
  const docRecord = sanitized as Record<string, unknown>;
  if (docRecord._id && !docRecord.id) {
    docRecord.id = docRecord._id.toString();
  }
  
  return sanitized;
}

export function sanitizeDocuments<T>(docs: T[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => sanitizeDocument(doc));
} 