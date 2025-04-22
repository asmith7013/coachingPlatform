<doc id="data-flow">

# Data Flow & Schema System

<section id="data-overview">

## Overview

Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.

[RULE] Always use Zod schemas as the canonical source of truth for data structures.

</section>

<section id="data-schemas">

## Zod Schema Architecture

Schemas are organized in `src/lib/zod-schema/` by domain:

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
<section id="data-form-config">
Field Configuration System
Field configurations in src/lib/ui-schema/fieldConfig/ define how form fields should be rendered and validated:
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
Form overrides (src/lib/ui-schema/formOverrides/) allow customization of form behavior for specific contexts:
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
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Implementation...
  
  return {
    schools,
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
Server actions provide a way to perform server-side operations directly from client components:
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
<section id="data-model-integration">
MongoDB Model Integration
MongoDB models are defined using the Zod schemas:
typescriptimport { SchoolZodSchema } from "@/lib/zod-schema/core/school";
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
</doc>