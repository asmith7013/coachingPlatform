
export function sanitizeDocument<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  
  // Ensure we have a plain object
  const plainObject = JSON.parse(JSON.stringify(doc));
  
  // Handle _id conversion
  const docRecord = plainObject as Record<string, unknown>;
  if (docRecord._id && !docRecord.id) {
    docRecord.id = docRecord._id.toString();
  }
  
  return plainObject as T;
}

export function sanitizeDocuments<T>(docs: T[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => sanitizeDocument(doc));
} 

