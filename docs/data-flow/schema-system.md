<doc id="schema-system">

# Data Flow & Schema System

<section id="data-overview">

## Overview

Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.

[RULE] Always use Zod schemas as the canonical source of truth for data structures.

</section>

<section id="data-schemas">

## Zod Schema Architecture

Schemas are organized in `src/lib/data-schema/zod-schema/` by domain:

- `core/`: Base schemas for common entities (School, Staff, Cycle)
- `shared/`: Reusable schema parts (notes, enums, date helpers)
- Domain-specific directories: `visits/`, `look-fors/`, etc.

```typescript
// Example: School schema
export const SchoolZodSchema = z.object({
  _id: z.string(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  staffList: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
[RULE] When adding new fields, always start by updating the Zod schema first.
</section>
<section id="data-model-integration">
MongoDB Model Integration
MongoDB models are defined using the Zod schemas and stored in src/lib/data-schema/mongoose-schema/:
typescriptimport { SchoolZodSchema } from "@/lib/data-schema/zod-schema/core/school";
import mongoose from "mongoose";

const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  // Additional fields...
};

const SchoolSchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
[RULE] MongoDB models should reflect the structure defined in Zod schemas.
</section>
<section id="data-form-config">
Field Configuration System
Field configurations in src/lib/ui/forms/fieldConfig/ define how form fields should be rendered and validated:
typescriptexport const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  {
    name: 'district',
    label: 'District',
    type: 'text',
    required: true,
  },
  // Additional fields...
];
[RULE] Field configs should reference schema properties rather than redefining them.
</section>
<section id="data-form-overrides">
Form Overrides
Form overrides (src/lib/ui/forms/formOverrides/) allow customization of form behavior for specific contexts:
typescriptexport const SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  district: {
    type: 'reference',
    label: 'District',
    url: '/api/districts',
    multiple: false,
  },
  // Additional overrides...
};
[RULE] Use form overrides to customize field behavior without modifying the base schema.
</section>
<section id="data-hooks">
Data Fetching Hooks
Custom hooks for data fetching provide a consistent interface across the application:
typescriptfunction useSchools() {
  const { data, error, isLoading } = useSafeSWR<School[]>('/api/schools');
  
  // Additional CRUD functions...
  
  return {
    schools: data?.items || [],
    error,
    isLoading,
    createSchool,
    updateSchool,
    deleteSchool,
  };
}
[RULE] Always return error and loading states from data hooks.
</section>
<section id="data-reference-hook">
Reference Data Hook
The useReferenceOptions hook handles fetching options for select components:
typescriptfunction useReferenceOptions(url: string, searchQuery: string = "") {
  // Using SWR with proper error handling
  const { data, error, isLoading } = useSWR(
    searchQuery ? `${url}?search=${searchQuery}` : url,
    fetcher
  );
  
  // Safely transform data to options format using memoization
  const options = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map(item => ({
      value: item._id,
      label: item.name || item.title || item.label || item.staffName || item.schoolName || String(item._id)
    }));
  }, [data]);
  
  return { options, error, isLoading };
}
[RULE] Use useReferenceOptions for all dropdown and multi-select inputs that fetch data.
[RULE] All API endpoints that serve reference data must return a standardized format with { items: [], total, success }.
</section>
<section id="data-server-actions">
Server Actions
Server actions in src/app/actions/ provide a way to perform server-side operations directly from client components:
typescriptexport async function createSchool(data: SchoolInput) {
  try {
    // Validate against schema
    const validated = SchoolInputZodSchema.parse(data);
    
    // Create in database
    const school = await SchoolModel.create(validated);
    
    // Return success response
    return { success: true, data: school };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }
    return handleServerError(error, "Failed to create school");
  }
}
[RULE] Always validate data with Zod schemas before database operations.
</section>
<section id="data-flow-diagram">
Data Flow Diagram
The data flows through our system in this sequence:

Zod Schema Definition: Define data structure and validation (/lib/data-schema/zod-schema/)
MongoDB Model Creation: Create database models based on schema (/lib/data-schema/mongoose-schema/)
Field Configuration: Define UI representation of data (/lib/ui/forms/fieldConfig/)
Server Actions/API Routes: Implement data operations (/app/actions/ or /app/api/)
React Hooks: Create data fetching and management hooks (/hooks/)
UI Components: Render data and handle user interactions (/components/)

[RULE] Follow this data flow sequence when implementing new features.
</section>
<section id="data-transformers">
Data Transformers
Data transformation utilities in src/lib/data-utilities/transformers/ help sanitize and validate data:
typescript// Sanitize a MongoDB document for client-side use
const safeDoc = sanitizeDocument(mongooseDoc, MyZodSchema);

// Validate against a schema and return null on error
const result = safeParseAndLog(MyZodSchema, data);

// Parse data and throw a formatted error if validation fails
const result = parseOrThrow(MyZodSchema, data);
[RULE] Use appropriate transformers when moving data between server and client.
</section>
<section id="data-consistency">
Maintaining Data Consistency
To ensure data consistency across the application:

Start with the Zod schema as the single source of truth
Generate TypeScript types from schemas using z.infer<typeof SchemaName>
Define MongoDB models that mirror the schema structure
Create field configurations and overrides based on the schema
Use transformers to sanitize data when crossing boundaries
Validate inputs against schemas at every entry point

[RULE] Apply these consistency practices at every layer of the application.
</section>
</doc>