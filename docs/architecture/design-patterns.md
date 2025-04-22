<doc id="design-patterns">

# Core Design Patterns

<section id="patterns-overview">

## Overview

Our application employs a set of consistent design patterns that solve common problems and promote code quality. These patterns provide a shared vocabulary and approach for the development team.

[RULE] Use these established patterns to solve common problems rather than creating one-off solutions.

</section>

<section id="hook-patterns">

## React Hook Patterns

### Resource Hooks

For data fetching and management, we use a consistent resource hook pattern:

```typescript
function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch implementation...
  
  return {
    schools,
    error,
    isLoading,
    createSchool,
    updateSchool,
    deleteSchool,
  };
}
These hooks:

Provide CRUD operations for a resource
Handle loading and error states
Maintain consistent return shapes
Support optimistic updates

Safe Data Fetching
For safer data fetching with SWR, we use the useSafeSWR hook:
typescriptfunction useSafeSWR<T>(key: string, fetcher?: Fetcher<T>) {
  // Implementation with error handling...
}

// Usage
const { data, error, isLoading } = useSafeSWR('/api/schools');
[RULE] Use appropriate hook patterns for data fetching and management.
</section>
<section id="component-patterns">
Component Patterns
Variant Pattern
Components use the variant pattern with Tailwind Variants:
typescriptconst button = tv({
  base: "inline-flex items-center justify-center font-medium",
  variants: {
    color: {
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
    size: {
      sm: "text-sm px-3 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  }
});

export function Button({ color, size, ...props }) {
  return (
    <button className={button({ color, size })} {...props} />
  );
}
Compound Components
For complex components, we use the compound component pattern:
typescriptfunction Table({ children, ...props }) {
  // Implementation...
}

Table.Header = function TableHeader({ children, ...props }) {
  // Implementation...
};

Table.Row = function TableRow({ children, ...props }) {
  // Implementation...
};

Table.Cell = function TableCell({ children, ...props }) {
  // Implementation...
};

// Usage
<Table>
  <Table.Header>...</Table.Header>
  <Table.Row>
    <Table.Cell>...</Table.Cell>
  </Table.Row>
</Table>
[RULE] Use variant and compound component patterns for flexible, reusable components.
</section>
<section id="form-patterns">
Form Patterns
Schema-Driven Forms
Forms are generated from Zod schemas and field configurations:
typescript// Field configuration derived from schema
const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  // Additional fields...
];

// Form component uses configuration
function SchoolForm() {
  return (
    <ResourceForm
      title="Add School"
      fields={SchoolFieldConfig}
      onSubmit={handleSubmit}
    />
  );
}
Field Overrides
Field configurations can be overridden for specific use cases:
typescriptconst SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  district: {
    type: 'reference',
    label: 'District',
    url: '/api/districts',
    multiple: false,
  },
};

function SchoolFormWithOverrides() {
  return (
    <ResourceForm
      title="Add School"
      fields={SchoolFieldConfig}
      overrides={SchoolOverrides}
      onSubmit={handleSubmit}
    />
  );
}
[RULE] Use schema-driven forms with field configurations and overrides.
</section>
<section id="error-patterns">
Error Handling Patterns
Error Handler Functions
Error handling is standardized with specialized handlers:
typescript// Client-side error handling
try {
  // Client-side operation
} catch (error) {
  const errorMessage = handleClientError(error);
  // Display to user
}

// Server-side error handling
try {
  // Server-side operation
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleValidationError(error);
  }
  return handleServerError(error);
}
Error Boundaries
For component-level error handling, we use error boundaries:
tsx<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={handleError}
>
  <ComponentThatMightError />
</ErrorBoundary>
[RULE] Use the appropriate error handling pattern based on the context.
</section>
<section id="api-patterns">
API Patterns
Standard Response
API responses follow a consistent structure:
typescriptinterface StandardResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}

// Example success response
{
  "items": [{ id: "1", name: "Item 1" }],
  "total": 1,
  "success": true
}

// Example error response
{
  "items": [],
  "success": false,
  "message": "Error message"
}
API Route Handler
API routes use the withStandardResponse wrapper:
typescriptexport const GET = withStandardResponse(async (request) => {
  // Implementation...
  return {
    items: await fetchItems(),
    total: items.length
  };
});
[RULE] Use the standard response format and API patterns for all server endpoints.
</section>
</doc>