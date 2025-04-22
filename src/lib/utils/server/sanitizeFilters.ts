interface DateRangeQuery {
  $gte?: Date;
  $lte?: Date;
}

interface MongoQuery {
  [key: string]: unknown | DateRangeQuery;
}

/**
 * Sanitizes filter values for MongoDB queries
 * Removes empty strings, whitespace-only strings, and empty arrays
 */
export function sanitizeFilters(filters: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    // Skip empty values
    if (value === undefined || value === null) continue;

    // Handle strings
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) sanitized[key] = trimmed;
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length > 0) sanitized[key] = value;
      continue;
    }

    // Handle objects (for nested queries)
    if (typeof value === "object") {
      const sanitizedNested = sanitizeFilters(value as Record<string, unknown>);
      if (Object.keys(sanitizedNested).length > 0) {
        sanitized[key] = sanitizedNested;
      }
      continue;
    }

    // Pass through other values
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Builds a text search query for MongoDB
 */
export function buildTextSearchQuery(fields: string[], searchTerm: string): Record<string, unknown> {
  if (!searchTerm?.trim()) return {};

  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm.trim(), $options: "i" }
    }))
  };
}

/**
 * Builds a date range query for MongoDB
 */
export function buildDateRangeQuery(
  field: string,
  startDate?: string | Date,
  endDate?: string | Date
): MongoQuery {
  const query: MongoQuery = {};

  if (startDate) {
    query[field] = { $gte: new Date(startDate) };
  }

  if (endDate) {
    // Safely merge the date range query
    const existingQuery = query[field] as DateRangeQuery;
    query[field] = {
      ...(existingQuery || {}),
      $lte: new Date(endDate)
    };
  }

  return query;
} 