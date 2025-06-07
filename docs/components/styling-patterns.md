```markdown
<doc id="styling-patterns">

# Component Styling Patterns

<section id="styling-overview">

## Overview

This guide explains our approach to styling components using the token system. For detailed information about our token architecture, refer to the Design Token System documentation.

[RULE] Always use the appropriate styling approach based on the component type and usage context.

</section>

<section id="core-principles">

## Core Principles

Our styling system is based on three key concepts:

Design Tokens: Primitive values (colors, spacing, typography) defined in @/lib/ui/tokens/*
Component-Specific Variants: Style variations for a specific component using Tailwind Variants
Shared Behavior Variants: Common UI behaviors (disabled, loading, etc.) reused across components

This separation ensures consistency while maintaining flexibility across the application.
[RULE] Understand the difference between tokens (primitive values) and variants (reusable patterns).
</section>

<section id="when-to-use-tokens">

## Using Design Tokens

For detailed token usage guidelines, refer to the Design Token System documentation.

[RULE] Always import tokens directly from their respective modules, not through intermediate helpers.

</section>

<section id="best-practices">

## Best Practices

Atomic Components: Define complete, self-contained styling using tokens
Composed Components: Compose from atomic components instead of duplicating styles
Page Components: Use shared variants for one-off styling needs
Documentation: Document component variants in component files

This hybrid approach balances consistency with flexibility while avoiding duplication.
[RULE] Follow these best practices to maintain a clean, maintainable styling system.
</section>

<section id="example-implementation">

## Example Implementation

```tsx
// Button.tsx - An atomic component
import { cn } from '@ui/utils/formatters';;
import { tv } from 'tailwind-variants';
import { textColors, radii } from '@/lib/ui/tokens';
import { disabledVariant, loadingVariant } from '@/lib/ui/variants';

// Component-specific variants using tokens
const button = tv({
  base: [
    "inline-flex items-center justify-center transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
  ],
  variants: {
    // Import shared behavior variants
    disabled: disabledVariant.variants.disabled,
    loading: loadingVariant.variants.loading,
    
    // Component-specific variants
    variant: {
      primary: `bg-primary ${textColors.white} hover:bg-primary-600`,
      secondary: `bg-gray-200 ${textColors.dark} hover:bg-gray-300`,
      outline: `border border-gray-300 ${textColors.dark} hover:bg-gray-50`,
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
      lg: "text-lg px-6 py-3",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export function Button({
  variant,
  size,
  disabled,
  loading,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(button({ variant, size, disabled, loading }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
```
[RULE] Use this pattern as a reference for implementing components in the system.
</section>

</doc>
```
