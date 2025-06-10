# Component Styling Usage Guide

## Quick Reference

This guide provides practical examples for using our styling system. For comprehensive token architecture details, see [design-token-system].

[RULE] For detailed token usage and architecture information, see [design-token-system][token-overview].

## Basic Component Pattern

```tsx
// Button.tsx - Basic component implementation
import { cn } from '@ui/utils/formatters';
import { tv } from 'tailwind-variants';
import { textColors, radii } from '@/lib/ui/tokens';
import { disabledVariant, loadingVariant } from '@/lib/ui/variants';

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

## Common Import Patterns

```typescript
// Token imports
import { textColors, backgroundColors, spacing, radii } from '@/lib/ui/tokens';

// Shared variant imports
import { disabledVariant, loadingVariant, focusVariant } from '@/lib/ui/variants';

// Utility imports
import { cn } from '@ui/utils/formatters';
import { tv } from 'tailwind-variants';
```

## Quick Usage Rules

1. **Always use tokens**: Import from `@/lib/ui/tokens` for colors, spacing, etc.
2. **Reuse shared variants**: Import common behaviors from `@/lib/ui/variants`
3. **Use tv() for variants**: Define component variants with Tailwind Variants
4. **Apply cn() for className**: Use the className utility for merging classes

[RULE] Follow these patterns for consistent component styling implementation.