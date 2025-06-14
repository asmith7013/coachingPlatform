export function sanitizeDocument<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  
  // Convert Mongoose document to plain object if needed
  if (doc && typeof doc === 'object' && 'toObject' in doc && typeof doc.toObject === 'function') {
    // This is a Mongoose document - convert to plain object
    return doc.toObject() as T;
  }
  
  // Already a plain object
  return doc;
}

export function sanitizeDocuments<T>(docs: T[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => sanitizeDocument(doc));
} 

