<doc id="component-system">

# Component System Guide

<section id="component-overview">

## Overview

Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use design tokens for styling consistency, with Tailwind Variants (`tv()`) for component-specific variants.

[RULE] Follow the atomic design pattern: core → composed → domain → features.

</section>

<section id="component-organization">

## Component Organization

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

1. **Core Components**: Building blocks with minimal dependencies
2. **Composed Components**: Combinations of core components for common patterns
3. **Domain Components**: Business-specific implementations
4. **Error Components**: Error boundary and monitoring components
5. **Feature Components**: Complete features combining multiple domain components
6. **Layout Components**: Page and application structure components
7. **Shared Components**: Cross-cutting utility components
8. **Debug Components**: Used during development and debugging

[RULE] Place new components in the appropriate directory based on their complexity and purpose.

</section>

<section id="styling-approach">

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
Component-Specific Variants
For component-level styling variations, use Tailwind Variants:
typescriptconst button = tv({
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
Shared Behavior Variants
For common UI behaviors that appear across many components, use shared variants:
typescriptimport { disabledVariant, loadingVariant } from '@/lib/ui/variants';

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

typescript// Token imports
import { 
  textSize, 
  textColors, 
  weight,
  paddingX,
  paddingY,
  radii
} from '@/lib/ui/tokens';
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

typescript// Example atomic component
function Button({ variant, size, disabled, ...props }) {
  return (
    <button 
      className={buttonStyles({ variant, size, disabled })}
      disabled={disabled}
      {...props}
    />
  );
}

// Component-specific variants
const buttonStyles = tv({
  base: "inline-flex...",
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
    disabled: disabledVariant.variants.disabled
  }
});
Shared Variants

Used for one-off styling needs
Provide common UI behaviors (disabled, loading, error states)
Used directly in JSX for quick styling

tsx// Example one-off styling
import { flexVariant, disabledVariant } from '@/lib/ui/variants';

<div className={cn(
  flexVariant({ direction: 'col', align: 'center' }),
  isDisabled && 'opacity-50 pointer-events-none'
)}>
  Content
</div>
[RULE] Use atomic components for reused UI elements and shared variants for one-off styling and common behaviors.
</section>
<section id="component-form">
Form Components
Form components use the schema-driven approach:
typescript// ResourceForm.tsx
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
[RULE] Use the ResourceForm component for all resource creation and editing.
</section>
<section id="component-compound">

## Compound Component Pattern

Our system uses the compound component pattern for complex interactive components that have multiple related parts. This pattern offers a more intuitive API while maintaining the flexibility of our design token system.

### Implementation Approach

Components should follow this pattern when they represent a logical grouping of sub-components that:
- Share state or behavior
- Have clearly defined semantic relationships
- Need to be flexibly arranged in the DOM

```typescript
// Implementation using Context API
// Parent component with subcomponents attached
const CardRoot = ({
  className,
  children,
  padding = 'md',
  radius = 'md',
  variant = 'default',
  ...props
}) => {
  // Generate styles using Tailwind Variants
  const styles = card({ padding, radius, variant });
  
  return (
    <CardContext.Provider value={{ styles }}>
      <div className={cn(styles.root(), className)} {...props}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

// Subcomponents use context to access styles
const Header = ({ className, children }) => {
  const { styles } = useCardContext();
  return (
    <div className={cn(styles.header(), className)}>
      {children}
    </div>
  );
};

// Export component with subcomponents attached
export const Card = Object.assign(CardRoot, {
  Header,
  Body,
  Footer
});
```
Usage Pattern
This pattern creates a more natural composition in JSX:
tsx<Card padding="lg" variant="white">
  <Card.Header>Card Title</Card.Header>
  <Card.Body>
    <p>Main content goes here</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
Backwards Compatibility
For backwards compatibility, include a Legacy property that implements the previous props-based approach:
typescript// For backwards compatibility
const LegacyCard = ({
  header,
  footer,
  children,
  ...props
}) => {
  const styles = card(props);
  
  return (
    <div className={styles.root()}>
      {header && <div className={styles.header()}>{header}</div>}
      {children && <div className={styles.content()}>{children}</div>}
      {footer && <div className={styles.footer()}>{footer}</div>}
    </div>
  );
};
```
Card.Legacy = LegacyCard;

When To Use
Use the compound component pattern for:

Complex interactive components (dialogs, tabs, accordions)
Components with multiple related parts that share state
Components where DOM structure flexibility is important
Components that benefit from a more declarative API

[RULE] All complex interactive components should implement the compound component pattern with Context API for state sharing.
</section>
<section id="component-error-display">
Error Display
Components should display errors in a consistent manner:
tsx// Form field error
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
[RULE] Always display errors using the appropriate error component.
</section>
</doc>