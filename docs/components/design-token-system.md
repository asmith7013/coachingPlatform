```markdown
<doc id="design-token-system">

Design Token System

<section id="token-overview">
Overview
Our design token system creates a clear separation between raw Tailwind CSS classes and semantic styling values. This approach ensures consistent visual design while maintaining flexibility for developers.
[RULE] Always use the token system rather than hardcoded Tailwind classes.
</section>

<section id="token-implementation-standards">

## Token Implementation Standards

Our project follows a consistent token-first implementation approach based on our semantic color system. This ensures design consistency, type safety, and maintainability across the entire application.

### Semantic Color System

We use a two-level semantic color system:
1. **Semantic Color Map**: Maps design concepts to color names
2. **Tailwind Color Definitions**: Defines the actual color values with variants

```typescript
// Semantic mapping of concepts to color names
export const semanticColorMap = {
  primary: 'red-violet',
  secondary: 'paynes-gray',
  text: 'gunmetal',
  danger: 'raspberry',
  // Other semantic mappings...
};

// Tailwind color definitions with variants
export const tailwindColors = {
  'red-violet': {
    DEFAULT: '#c52184',
    100: '#27071a',
    // Color variants...
  },
  // Other color definitions...
};
```
Token Definitions
Tokens reference the semantic color system rather than hardcoding specific colors:

```typescript
// Text color tokens
export const textColors = {
  default: `text-${textColors.text} dark:text-${textColors.surface}`,
  muted: `text-${textColors.subtleText} dark:text-${textColors.muted}`,
  accent: `text-${textColors.primary} dark:text-${textColors.primary}-300`,
  // Additional semantic text colors...
};
```
// Similar patterns for backgroundColors, borderColors, etc.
Using Tokens in Components
Always use token references instead of direct Tailwind classes for design properties:

```typescript
// Component implementation example
const componentVariants = tv({
  slots: {
    root: `flex items-center p-4 ${radii.md}`,
    title: `${textSize.base} ${textColors.default} font-medium`,
  },
  variants: {
    variant: {
      default: { 
        root: `${backgroundColors.default} ${borderColors.default}` 
      },
      primary: { 
        root: `${backgroundColors.primary} ${borderColors.primary}` 
      },
      // Other variants...
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
```
Benefits of This Approach

Semantic Layering: Changes to the semantic color map automatically propagate to all components
Design Language Consistency: Unified color system across the entire application
Theme Adaptability: Easier to implement dark mode and alternative themes
Visual Cohesion: Ensuring color relationships remain consistent
Single Source of Truth: Color decisions are centralized in semantic mappings

[RULE] Always use semantic token references instead of direct Tailwind classes to maintain design system consistency.
</section>

<section id="token-architecture">
Token Architecture
Primitive Tokens
Located in src/lib/ui/tokens/, these define the foundational design values:

```typescript
// src/lib/ui/tokens/colors.ts
export const textColors = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-gray-600 dark:text-gray-300",
  danger: "text-red-600 dark:text-red-400",
  white: "text-white",
  dark: "text-gray-900 dark:text-white",
};

// src/lib/ui/tokens/spacing.ts
export const padding = {
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export const paddingX = {
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
};
```
[RULE] Define all primitive design values as tokens in the appropriate token files.
</section>

<section id="component-variants">
Component-Specific Variants
These use Tailwind Variants (tv()) to create type-safe component styling:

```typescript
// Example: Button component variants
import { tv } from "tailwind-variants";
import { textColors, paddingX, paddingY, radii } from '@/lib/ui/tokens';

const button = tv({
  base: "inline-flex items-center justify-center transition-colors",
  variants: {
    variant: {
      primary: `${backgroundColor.primary} ${textColors.white} hover:bg-blue-700`,
      secondary: `${backgroundColor.secondary} ${textColors.dark} hover:bg-gray-300`,
      outline: `${backgroundColor.outline} ${textColors.dark} hover:bg-gray-50`,
    },
    size: {
      sm: `${paddingX.sm} ${paddingY.xs} text-sm`,
      md: `${paddingX.md} ${paddingY.sm} text-base`,
      lg: `${paddingX.lg} ${paddingY.md} text-lg`,
    },
    rounded: {
      none: "",
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      full: radii.full,
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    rounded: "md",
  },
});
```
[RULE] Define component-specific styling using Tailwind Variants and primitive tokens.
</section>

<section id="shared-variants">
Shared Behavior Variants
Reusable UI behavior patterns located in src/lib/ui/variants/:

```typescript
// src/lib/ui/variants/shared-variants.ts
import { tv } from "tailwind-variants";

export const disabledVariant = tv({
  variants: {
    disabled: {
      true: "opacity-50 pointer-events-none cursor-not-allowed",
      false: "",
    }
  },
  defaultVariants: {
    disabled: false
  }
});

export const loadingVariant = tv({
  variants: {
    loading: {
      true: "relative text-transparent pointer-events-none",
      false: "",
    }
  },
  defaultVariants: {
    loading: false
  }
});

export const flexVariant = tv({
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "row",
    align: "start",
    justify: "start",
    wrap: false,
  },
  compoundVariants: [
    {
      direction: "row",
      class: "flex"
    },
    {
      direction: "col",
      class: "flex"
    }
  ]
});
```
[RULE] Use shared variants for common UI behaviors across multiple components.
</section>

<section id="usage-guidelines">
Usage Guidelines
When to Use Tokens Directly
Use tokens directly in these scenarios:

Building atomic components (basic UI elements)
Defining explicit styling that shouldn't change
Creating component-specific variants

```typescript
import { textColors, radii } from '@/lib/ui/tokens';

function Alert({ children }) {
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
When to Use Component Variants
Use component variants when:

Defining styling options for a component
Creating a component with multiple visual presentations
Building complex compositions of styles

```typescript
function Button({ variant, size, disabled, children, ...props }) {
  return (
    <button
      className={button({ variant, size, disabled })}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```
When to Use Shared Variants
Use shared variants when:

Adding common behaviors (disabled, loading, error states)
Quickly styling one-off elements without creating a component
Applying consistent patterns across unrelated components

```tsx
import { flexVariant, disabledVariant } from '@/lib/ui/variants';

// In a component
<div className={cn(
  flexVariant({ direction: 'col', align: 'center' }),
  disabledVariant({ disabled: isDisabled })
)}>
  {children}
</div>
```
[RULE] Choose the appropriate token approach based on the specific use case.
</section>

<section id="tailwind-integration">
Tailwind Integration
Our token system sits on top of Tailwind CSS v4, providing a semantic layer between raw utility classes and component styling. This allows us to:

Maintain consistent design values across the application
Change the underlying styling without modifying component code
Support dark mode and other themes with minimal effort
Ensure type safety with TypeScript integration

[RULE] Leverage the token system to abstract away direct Tailwind class dependencies.
</section>
</doc>
```
