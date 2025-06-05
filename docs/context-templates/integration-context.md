# Integration Context Template

## Always Include (Core Context):
- `/docs/data-flow/api-patterns.md` - API standardization patterns
- `/docs/data-flow/error-handling.md` - Integration error handling
- `/src/lib/types/core/response.ts` - Standard response formats

## Integration-Specific Context (Choose Based on Integration Type):

### Monday.com Integration:
- `/src/lib/integrations/monday/` - Complete Monday integration system
- `/src/app/actions/integrations/monday.ts` - Monday server actions
- `/src/components/integrations/monday/` - Monday UI components
- `/docs/data-flow/monday-integration.md` - Monday-specific patterns

### External API Integration:
- `/src/app/api/integrations/` - API route patterns
- `/src/lib/api/client/` - Client-side API utilities
- `/src/lib/api/validation/` - Request validation patterns

### Database Integration:
- `/src/lib/server/db/` - Database connection patterns
- `/src/lib/server/crud/` - CRUD operation utilities
- `/docs/data-flow/mongodb-integration.md` - MongoDB patterns

## Conditional Context (Include If Needed):
- `/docs/data-flow/authentication.md` - If auth integration needed
- `/src/lib/transformers/` - If data transformation needed
- `/docs/workflows/cursor-integration.md` - If complex multi-step integration

## Quality Gates:
- **API Consistency:** Follow standard response format
- **Error Handling:** Use appropriate error handlers for context
- **Type Safety:** Maintain type safety across integration boundaries
- **Separation:** Keep integration logic separate from business logic

## Integration Flow Template:
```
# Integration Implementation Flow

## Stage 1: API Client Setup
Context: [API client examples]
Task: Create integration client with error handling
Pattern: Follow established API client patterns

## Stage 2: Data Transformation
Context: [Transformation examples]  
Task: Create mappers between external and internal formats
Pattern: Use transformation system utilities

## Stage 3: Server Actions
Context: [Integration action examples]
Task: Create server actions for integration operations
Pattern: Handle external API errors appropriately

## Stage 4: UI Components
Context: [Integration UI examples]
Task: Create components for integration features
Pattern: Follow domain component structure
```
