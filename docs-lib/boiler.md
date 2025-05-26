Implement Reference System Across All Domain Schemas
SCOPE

IN SCOPE: Implementing the reference system for all domain schemas following the School schema example
OUT OF SCOPE: UI components, server-side implementations, database models

OVERVIEW
This implementation creates a consistent reference system across all domain schemas by:

Organizing each schema with a Fields object
Merging with BaseDocumentSchema for the full schema
Creating reference schemas with specific fields
Implementing transformer functions
Adding display helper functions

IMPLEMENTATION PATTERNS
Core Structure for Each Schema
typescript// 1. Define entity fields
export const EntityFieldsSchema = z.object({ /* fields */ });

// 2. Create full schema
export const EntityZodSchema = BaseDocumentSchema.merge(EntityFieldsSchema);

// 3. Create input schema
export const EntityInputZodSchema = toInputSchema(EntityZodSchema);

// 4. Create reference schema
export const EntityReferenceZodSchema = BaseReferenceZodSchema.merge(
  EntityFieldsSchema
    .pick({ /* selected fields */ })
    .partial()
).extend({ /* derived fields */ });

// 5. Create transformers
export const entityToReference = createReferenceTransformer<Entity, EntityReference>(
  // Label function
  (entity) => entity.name,
  // Fields function
  (entity) => ({ /* selected/derived fields */ }),
  // Validation schema
  EntityReferenceZodSchema
);

// 6. Create array transformer
export const entitiesToReferences = createArrayTransformer<Entity, EntityReference>(
  entityToReference
);

// 7. Add helper functions
export function getEntityDisplayName(entity: Entity): string {
  return `${entity.property1} - ${entity.property2}`;
}

// 8. Export types
export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
export type EntityReference = z.infer<typeof EntityReferenceZodSchema>;

