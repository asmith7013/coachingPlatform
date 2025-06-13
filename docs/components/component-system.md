# Component System

## Overview

Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use design tokens for styling consistency, with Tailwind Variants (tv()) for component-specific variants.

**[RULE]** Follow the atomic design pattern: core → composed → domain → features.

## Component Organization

Components are organized by their level of complexity and purpose:

```
components/
├── core/               # Primitive UI elements
│   ├── feedback/       # Feedback indicators (Badge, etc.)
│   ├── fields/         # Form input components
│   ├── layout/         # Layout primitives
│   └── typography/     # Text elements (Heading, Text)
├── composed/           # Combinations of core components
│   ├── cards/          # Card components
│   ├── dialogs/        # Dialog components
│   ├── forms/          # Form components
│   ├── tables/         # Table components
│   └── tabs/           # Tab components
├── domain/             # Business domain specific components
│   ├── schedules/      # Schedule components
│   ├── schools/        # School components
│   ├── staff/          # Staff components
│   └── visits/         # Visit components
├── features/           # Complete feature implementations
├── layouts/            # Page layout components
└── shared/             # Cross-cutting components
```

Each component type serves a specific purpose:

- **Core Components**: Building blocks with minimal dependencies
- **Composed Components**: Combinations of core components for common patterns
- **Domain Components**: Business-specific implementations
- **Feature Components**: Complete features combining multiple domain components

### Component Boundary Examples

**Core Component** - Atomic UI element with no business logic:
```typescript
// src/components/core/Button.tsx
export function Button({ intent, appearance, children, ...props }) {
  return (
    <button className={buttonVariants({ intent, appearance })} {...props}>
      {children}
    </button>
  );
}
```

**Composed Component** - Combines core components for layout/structure:
```typescript
// src/components/composed/layouts/DashboardPage.tsx
export function DashboardPage({ children, dehydratedState }) {
  const content = dehydratedState ? (
    <HydrationBoundary state={dehydratedState}>
      {children}
    </HydrationBoundary>
  ) : children;

  return <div className="space-y-6">{content}</div>;
}
```

**Domain Component** - Contains business logic and domain knowledge:
```typescript
// src/components/domain/schools/SchoolCard.tsx
export function SchoolCard({ school, onDelete }) {
  const schoolSlug = schoolToSlug(school); // Domain-specific logic
  
  return (
    <Card>
      <Link href={`/dashboard/schools/${schoolSlug}`}>
        <Heading>{school.emoji} {school.schoolName}</Heading>
        <Text>District: {school.district}</Text>
        {/* School-specific rendering logic */}
      </Link>
    </Card>
  );
}
```

**[RULE]** Place new components in the appropriate directory based on their complexity and purpose.

## Styling Approach

Our project uses a clear approach to styling that separates concerns:

### Design Tokens

Tokens are primitive style values defined in `@/lib/ui/tokens/*`:

```typescript
// Example token usage in components
import { textColors, radii } from '@/lib/ui/tokens';

function Alert() {
  return (
    <div className={cn(
      "p-4 border",
      textColors.danger,
      radii.md
    )}>
      {children}
    </div>
  );
}
```

### Component-Specific Variants

For component-level styling variations, use Tailwind Variants:

```typescript
const button = tv({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      primary: textColors.primary,
      secondary: textColors.secondary,
    },
    size: {
      sm: "text-sm p-2",
      md: "text-base p-4",
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
});
```

### Shared Behavior Variants

For common UI behaviors that appear across many components, use shared variants:

```typescript
import { disabledVariant, loadingVariant } from '@/lib/ui/variants';

const myComponent = tv({
  variants: {
    disabled: disabledVariant.variants.disabled,
    loading: loadingVariant.variants.loading,
    // Component-specific variants...
  }
});
```

**[RULE]** Use tokens directly in atomic components, component-specific variants for styling variations, and shared variants for common behaviors.

## Implementation Standards

All components should follow these implementation standards:

### Standard Imports

```typescript
// Standard import pattern
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants';

// Token imports
import { textColors, spacing, radii } from '@ui-tokens/tokens';

// Shared variant imports (when needed)
import { disabledVariant, interactiveVariant } from '@ui-variants/shared-variants';
```

### Component Patterns

**Compound Component Pattern**: Some components like Alert use the compound component pattern:

```tsx
// ✅ Correct usage of compound components
<Alert variant="warning" layout="stacked">
  <Alert.Title>Please Review</Alert.Title>
  <Alert.Description>
    Some information requires your attention.
  </Alert.Description>
</Alert>
```

**Typography System**: Use our Text and Heading components rather than raw HTML:

```tsx
// ✅ Correct: Using the Text component with tokens
<Text textSize="lg" weight="semibold" color="accent">
  Important message
</Text>

// ❌ Incorrect: Using raw HTML with direct classes
<p className="text-lg font-semibold text-blue-600">
  Important message
</p>
```

**[RULE]** Always use component APIs rather than direct Tailwind classes, and follow the established patterns for each component type.

### Toast Integration in Components

Components should choose appropriate hook variants based on their user interaction context:

```typescript
// Form components - use toast feedback for user actions
function EntityCreateForm() {
  const { createWithToast, isCreating } = useEntities.withNotifications();
  
  const handleSubmit = async (data: EntityInput) => {
    try {
      await createWithToast(data);
      onSuccess?.(); // Additional success handling
    } catch (error) {
      // Error already shown via toast
      console.error('Create failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" loading={isCreating}>
        Create Entity
      </Button>
    </form>
  );
}

// Background operations - use silent methods
function DataSyncService() {
  const { createAsync } = useEntities.manager();
  
  const syncData = async (entities: EntityInput[]) => {
    // Silent operation, handle feedback through other means
    const results = await Promise.allSettled(
      entities.map(entity => createAsync(entity))
    );
    
    // Custom notification logic for bulk operations
    const successful = results.filter(r => r.status === 'fulfilled').length;
    toast.success(`Synced ${successful}/${entities.length} entities`);
  };
}

// Complex operations - compose multiple hook variants
function EntityManagementPanel() {
  const entitiesWithToasts = useEntities.withNotifications();
  const entitiesWithInvalidation = useEntities.withInvalidation();
  
  const handleUserAction = async (data: EntityInput) => {
    // User-triggered action with toast feedback
    await entitiesWithToasts.createWithToast(data);
  };
  
  const handleSystemRefresh = async () => {
    // System action with manual cache control
    await entitiesWithInvalidation.refreshAllEntities();
  };
}
```

**Toast Usage Guidelines:**
- **User Actions**: Use `withToast` methods for form submissions and user-triggered operations
- **Background Operations**: Use silent methods for system processes and bulk operations
- **Error Handling**: Toast-enabled methods handle error display automatically
- **Loading States**: Use mutation loading states for UI feedback during operations

**[RULE]** Choose hook variants based on interaction context - use toast feedback for user actions and silent operations for background processes.

## Feature Context Patterns

Complex features use React Context for state management following a standardized pattern:

### Context Architecture

```typescript
// Define clean context interface
interface ScheduleContextType {
  // Core props
  schoolId: string;
  date: string;
  mode: 'create' | 'edit';
  
  // Data (from domain hooks)
  teachers: NYCPSStaff[];
  visits: Visit[];
  isLoading: boolean;
  
  // UI state
  uiState: ScheduleUIState;
  selectTeacherPeriod: (teacherId: string, period: number) => void;
  
  // Operations (delegated to domain hooks)
  scheduleVisit: (data: VisitCreationData) => Promise<ActionResult>;
}
```

### Provider Implementation

```typescript
export function ScheduleProvider({ 
  schoolId, 
  date, 
  mode = 'create',
  children 
}: ScheduleProviderProps) {
  // Compose focused hooks with single responsibilities
  const scheduleData = useScheduleData({ schoolId, date, mode });
  const scheduleActions = useScheduleActions({ schoolId, date });
  const scheduleState = useScheduleState();
  
  const contextValue: ScheduleContextType = {
    // Core props
    schoolId,
    date,
    mode,
    
    // Data (pass through from domain hooks)
    teachers: scheduleData.teachers,
    visits: scheduleData.visits,
    isLoading: Boolean(scheduleData.isLoading || scheduleActions.isLoading),
    
    // UI state
    uiState: scheduleState.uiState,
    selectTeacherPeriod: scheduleState.selectTeacherPeriod,
    
    // Operations (delegated)
    scheduleVisit: scheduleActions.scheduleVisit
  };
  
  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}
```

### Hook Composition Pattern

Feature contexts compose multiple focused hooks:

```typescript
// Data fetching hook
const useScheduleData = ({ schoolId, date, mode }) => {
  const { data: teachers } = useNYCPSStaff.list();
  const { data: visits } = useVisits.list({ schoolId, date });
  
  return { teachers, visits, isLoading, error };
};

// Operations hook
const useScheduleActions = ({ schoolId, date }) => {
  const { mutate: createVisit } = useVisits.mutations().create;
  
  const scheduleVisit = async (data: VisitCreationData) => {
    // Business logic...
    return createVisit(visitData);
  };
  
  return { scheduleVisit };
};

// UI state hook
const useScheduleState = () => {
  const [uiState, setUiState] = useState<ScheduleUIState>({
    selectedTeacher: null,
    selectedPeriod: null
  });
  
  return { uiState, selectTeacherPeriod };
};
```

**[RULE]** Use this context pattern for features with multiple components and shared state.

## Feature Component Architecture

Feature components represent complete, self-contained functionality with their own state management and business logic:

```
components/features/schedulesNew/
├── context/                 # Feature-specific context
│   ├── ScheduleContext.tsx    # Main context provider
│   └── index.ts               # Context exports
├── hooks/                   # Feature-specific hooks
│   ├── useScheduleData.ts     # Data fetching
│   ├── useScheduleActions.ts  # Operations
│   ├── useScheduleState.ts    # UI state
│   └── index.ts               # Hook exports
├── types.ts                 # Feature types
├── DropZoneCell.tsx         # Individual components
├── ScheduleGrid.tsx
└── index.ts                 # Feature exports
```

Feature components follow these principles:
- **Self-Contained**: All related functionality in one directory
- **Context-Driven**: Centralized state through React Context
- **Modular Hooks**: Separated concerns (data, actions, UI state)
- **Domain-Specific**: Business logic encapsulated within the feature

**[RULE]** Use this architecture for complex features with multiple components and shared state.

## Form Components

Our form system follows a domain-specific composition pattern that leverages TanStack Form's native API while maintaining consistency and DRY principles. This approach separates form layout, field rendering, and business logic into distinct, reusable concerns.

### Form Architecture

The form system consists of three main layers:

1. **Form Factory** - Creates type-safe TanStack Form instances
2. **Layout Components** - Handle visual presentation and structure
3. **Field Renderer Hook** - Provides consistent field rendering logic
4. **Domain Components** - Combine layers for specific business entities

### Entity Form Factory

The `createEntityForm` factory provides type-safe form creation with schema validation:

```typescript
// src/lib/ui/forms/factories/createEntityForm.ts
import { useForm } from '@tanstack/react-form';
import type { ZodSchema } from 'zod';

export function createEntityForm<T extends Record<string, unknown>>(config: {
  schema: ZodSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => void | Promise<void>;
}) {
  return useForm({
    defaultValues: config.defaultValues,
    validators: {
      onChange: config.schema,
    },
    onSubmit: async ({ value }) => {
      await config.onSubmit(value);
    },
  });
}
```

### Form Layout Component

The `FormLayout` component handles visual presentation without form logic:

```typescript
// src/components/composed/forms/FormLayout.tsx
interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
}

export function FormLayout({
  title,
  children,
  submitLabel = 'Submit',
  isSubmitting = false,
  canSubmit = true,
  // ...other props
}: FormLayoutProps) {
  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">{title}</h2>
      </Card.Header>
      
      <Card.Body>
        <fieldset disabled={isSubmitting} className="space-y-4">
          {children}
        </fieldset>
      </Card.Body>
      
      <Card.Footer>
        <Button
          type="submit"
          intent="primary"
          loading={isSubmitting}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </Card.Footer>
    </Card>
  );
}
```

### Field Renderer Hook

The `useFieldRenderer` hook provides consistent field rendering:

```typescript
// src/lib/ui/forms/hooks/useFieldRenderer.tsx
export function useFieldRenderer<T extends Record<string, unknown>>() {
  const renderField = (field: Field<T>, fieldApi: any) => {
    const hasError = fieldApi.state.meta.errors?.length > 0;
    const errorMessage = hasError ? fieldApi.state.meta.errors[0] : undefined;

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <Input
              value={fieldApi.state.value || ''}
              onChange={(e) => fieldApi.handleChange(e.target.value)}
              onBlur={fieldApi.handleBlur}
              error={hasError}
              placeholder={field.placeholder}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-1">
            <Select
              value={fieldApi.state.value}
              onValueChange={fieldApi.handleChange}
              options={field.options || []}
              error={hasError}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );
        
      // Additional field types...
    }
  };

  return { renderField };
}
```

### Domain-Specific Form Implementation

Domain forms combine all layers for specific entities:

```typescript
// src/components/domain/schools/SchoolForm.tsx
import { createEntityForm } from '@/lib/ui/forms/factories/createEntityForm';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@/lib/ui/forms/hooks/useFieldRenderer';
import { SchoolFieldConfig } from '@forms/fieldConfig/school';
import { SchoolInputZodSchema, type SchoolInput } from '@zod-schema/core/school';

interface SchoolFormProps {
  initialValues?: Partial<SchoolInput>;
  onSubmit: (data: SchoolInput) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
}

export function SchoolForm({
  initialValues = {},
  onSubmit,
  onCancel,
  title = 'School Form'
}: SchoolFormProps) {
  const { renderField } = useFieldRenderer<SchoolInput>();
  
  const form = createEntityForm({
    schema: SchoolInputZodSchema,
    defaultValues: {
      schoolNumber: '',
      district: '',
      schoolName: '',
      // ...other defaults
      ...initialValues
    } as SchoolInput,
    onSubmit,
  });

  return (
    <FormLayout
      title={title}
      onCancel={onCancel}
      isSubmitting={form.state.isSubmitting}
      canSubmit={form.state.canSubmit}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {SchoolFieldConfig.map((fieldConfig) => (
          <div key={String(fieldConfig.name)} className="space-y-2">
            <label
              htmlFor={String(fieldConfig.name)}
              className="text-sm font-medium"
            >
              {fieldConfig.label}
            </label>
            
            <form.Field name={String(fieldConfig.name)}>
              {(field) => renderField(fieldConfig, field)}
            </form.Field>
          </div>
        ))}
      </form>
    </FormLayout>
  );
}
```

### Form Usage in Pages

Domain forms integrate seamlessly into page components:

```typescript
// Example usage in a page component
export default function SchoolListPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const handleCreateSchool = async (data: SchoolInput) => {
    await createSchool(data);
    setShowCreateForm(false);
  };

  return (
    <div>
      {showCreateForm && (
        <SchoolForm
          title="Create New School"
          onSubmit={handleCreateSchool}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      {/* Rest of page content */}
    </div>
  );
}
```

### Benefits of This Approach

This domain-specific composition pattern provides:

- **Type Safety**: Full TypeScript inference through TanStack Form's native API
- **Separation of Concerns**: Layout, field rendering, and form logic are decoupled
- **Reusability**: FormLayout and field renderer work across all domain forms
- **Consistency**: All forms follow the same structural patterns
- **Schema Integration**: Zod schemas drive validation without transformations
- **Extensibility**: Easy to add new field types and domain forms

**[RULE]** Use domain-specific form components following this composition pattern for all entity forms.

## Error Handling Patterns

Components should display errors in a consistent manner:

```tsx
// Form field error
{error && (
  <div className={cn(textColors.danger, "text-sm mt-1")}>
    {error}
  </div>
)}

// API operation error
{error && (
  <Alert variant="error">
    <Alert.Title>Operation Failed</Alert.Title>
    <Alert.Description>{error}</Alert.Description>
  </Alert>
)}
```

**[RULE]** Always display errors using the appropriate error component.

## Component API Guidelines

### Variant Naming

Use consistent naming for component variants:
- `variant`: Primary style variation (primary, secondary, etc.)
- Descriptive names for other properties (size, color, etc.)
- Boolean flags for state variations (disabled, error, etc.)

### Field Component Pattern

Field components should:
- Use the FieldWrapper component for layout consistency
- Follow a consistent props interface
- Handle errors through the wrapper
- Support consistent size and padding variants

### Consumer Hook Pattern

Provide a typed hook for consuming context:

```typescript
export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('Schedule hooks must be used within ScheduleProvider');
  }
  return context;
}
```

**[RULE]** Follow these implementation standards for all components to ensure consistency and maintainability.