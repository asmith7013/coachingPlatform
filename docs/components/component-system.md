<doc id="component-system">

Component System Guide

<section id="component-overview">
Overview
Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use design tokens for styling consistency, with Tailwind Variants (tv()) for component-specific variants.
[RULE] Follow the atomic design pattern: core → composed → domain → features.
</section>

<section id="component-organization">
Component Organization
Components are organized by their level of complexity and purpose:
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
│   ├── imRoutine/      # Implementation routine components
│   ├── lookFors/       # Look-for components
│   ├── rubrics/        # Rubric components
│   ├── schedules/      # Schedule components
│   ├── schools/        # School components
│   ├── staff/          # Staff components
│   └── visits/         # Visit components
├── error/              # Error handling components
├── features/           # Complete feature implementations
├── layouts/            # Page layout components
├── shared/             # Cross-cutting components
└── debug/              # Development and debugging components
Each component type serves a specific purpose:

Core Components: Building blocks with minimal dependencies
Composed Components: Combinations of core components for common patterns
Domain Components: Business-specific implementations
Error Components: Error boundary and monitoring components
Feature Components: Complete features combining multiple domain components
Layout Components: Page and application structure components
Shared Components: Cross-cutting utility components
Debug Components: Used during development and debugging

[RULE] Place new components in the appropriate directory based on their complexity and purpose.
</section>

<section id="implementation-standards">
Implementation Standards
All components should follow these implementation standards to ensure consistency across the codebase:
Standard Imports
Use consistent import patterns:

```typescript
// Standard import pattern
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants';

// Token imports
import { textColors, spacing, radii } from '@ui-tokens/tokens';

// Shared variant imports (when needed)
import { disabledVariant, interactiveVariant } from '@ui-variants/shared-variants';
```
Variant Naming
Use consistent naming for component variants:

variant: Primary style variation (primary, secondary, etc.)
Descriptive names for other properties (size, color, etc.)
Boolean flags for state variations (disabled, error, etc.)

Field Component Pattern
Field components should:

Use the FieldWrapper component for layout consistency
Follow a consistent props interface
Handle errors through the wrapper
Support consistent size and padding variants

[RULE] Follow these implementation standards for all components to ensure consistency and maintainability.
</section>

<section id="styling-approach">
Styling Approach
Our project uses a clear approach to styling that separates concerns:
Design Tokens
Tokens are primitive style values defined in @/lib/ui/tokens/*:

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
Component-Specific Variants
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
Shared Behavior Variants
For common UI behaviors that appear across many components, use shared variants:

```typescript
import { disabledVariant, loadingVariant } from '@/lib/ui/variants';

const myComponent = tv({
  // ...
  variants: {
    // Use shared behavior variants
    disabled: disabledVariant.variants.disabled,
    loading: loadingVariant.variants.loading,
    
    // Component-specific variants
    // ...
  }
});
```
[RULE] Use tokens directly in atomic components, component-specific variants for styling variations, and shared variants for common behaviors.
</section>

<section id="component-tokens">
Design System Tokens
Our design system provides tokens for:

Typography: Text sizes, weights, and colors
Spacing: Padding, margins, and gaps
Colors: Semantic color mapping
Shapes: Border radius and shadows
Layout: Grid and flex utilities

```typescript
// Token imports
import { 
  textSize, 
  textColors, 
  weight,
  paddingX,
  paddingY,
  radii
} from '@/lib/ui/tokens';
```
[RULE] Always import tokens directly from their respective files, not through intermediate helpers.
</section>

<section id="atomic-vs-shared">
Atomic Components vs Shared Variants
Our system uses a hybrid approach:
Atomic Components

Self-contained with explicit styling
Use tokens directly for predictable rendering
Define component-specific variants
Handle internal state and interactions

Shared Variants

Used for one-off styling needs
Provide common UI behaviors (disabled, loading, error states)
Used directly in JSX for quick styling

[RULE] Use atomic components for reused UI elements and shared variants for one-off styling and common behaviors.
</section>

<section id="component-form">
Form Components
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
[RULE] Use the ResourceForm component for all resource creation and editing.
</section>

<section id="responsive-layout-patterns">

## Responsive Layout Patterns

Our component system uses consistent responsive patterns to ensure optimal display across different screen sizes:

### Side-by-Side Layout Pattern

The responsive side-by-side layout pattern is used for components with a primary element (title, heading) and secondary element (description, metadata):

- Displays vertically (stacked) on mobile devices
- Displays horizontally (side-by-side) on larger screens

This pattern is implemented using our `responsiveLayoutVariant`:

```typescript
import { responsiveLayoutVariant } from "@ui-variants/layout";

const alert = tv({
  slots: {
    root: responsiveLayoutVariant({ stack: 'responsive' }).container(),
    title: responsiveLayoutVariant({ stack: 'responsive', titleSpacing: 'responsive' }).title(),
    description: responsiveLayoutVariant({ stack: 'responsive', contentWidth: 'responsive' }).content(),
  },
  // Additional variants...
});
```
Icon and Content Layout
For components that combine icons with text (buttons, menu items, etc.), use the iconContentLayoutVariant:

```typescript
import { iconContentLayoutVariant } from "@ui-variants/layout";

const button = tv({
  slots: {
    base: `inline-flex items-center justify-center font-semibold`,
    iconWrapper: iconContentLayoutVariant({ position: 'left' }).icon(),
    content: '',
  },
  variants: {
    iconPosition: {
      left: {
        iconWrapper: iconContentLayoutVariant({ position: 'left' }).icon(),
      },
      right: {
        iconWrapper: iconContentLayoutVariant({ position: 'right' }).icon(),
      },
      responsive: {
        iconWrapper: iconContentLayoutVariant({ position: 'responsive' }).icon(),
      },
    },
  },
  // Additional variants...
});
```
Responsive Grid Layout
For grid-based layouts that adapt to screen sizes, use the responsiveGridVariant:

```typescript
import { responsiveGridVariant } from "@ui-variants/layout";

const cardGrid = responsiveGridVariant({ columns: '1-2-3', gap: 'responsive' })();
```
Available Responsive Variants
Our system provides these key responsive variants:

responsiveLayoutVariant: For components with title/description pairs
iconContentLayoutVariant: For components with icons and text
responsiveGridVariant: For grid layouts
responsiveSpacingVariant: For consistent spacing across breakpoints

[RULE] Use the responsive layout pattern for all components with primary/secondary element pairs.
</section>

<section id="component-error-display">
Error Display
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
    <AlertTitle>Operation Failed</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

[RULE] Always display errors using the appropriate error component.
</section>
</doc>