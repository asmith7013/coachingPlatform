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

Form components use the schema-driven approach:

```typescript
// ResourceForm.tsx
export function ResourceForm<T extends Record<string, unknown>>({
  title,
  fields,
  onSubmit,
  defaultValues,
}: ResourceFormProps<T>) {
  // Form implementation...
  
  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => renderField(field))}
      <Button type="submit">Save</Button>
    </form>
  );
}
```

**[RULE]** Use the ResourceForm component for all resource creation and editing.

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