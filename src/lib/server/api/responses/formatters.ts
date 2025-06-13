export function sanitizeDocument<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  
  // Simple: just return the doc - Mongoose handles the transformation
  return doc;
}

export function sanitizeDocuments<T>(docs: T[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => sanitizeDocument(doc));
} 

