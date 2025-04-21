# Token System Guidelines

This document provides guidelines for using the design token system to ensure consistency across the application.

## Core Principles

1. **Use tokens instead of hardcoded Tailwind classes**
2. **Import tokens from their respective files**
3. **Use the tv() utility for defining component variants**
4. **Use semantic color names over raw color values**
5. **Ensure type-safety with centralized types**
6. **Always expand token keys individually instead of spreading**

## Token Structure

Our token system is organized in the following files:

| File | Description | Examples |
|------|-------------|----------|
| `tokens/typography.ts` | Text sizes, headings, weights | `textSize.sm`, `heading.h1`, `weight.bold` |
| `tokens/text.ts` | Text colors, alignments | `textColors.muted`, `alignments.center` |
| `tokens/colors.ts` | Semantic and tailwind colors | `semanticColorMap.primary`, `tailwindColors.gunmetal` |
| `tokens/shape.ts` | Border radius, shadows | `radii.md`, `shadows.sm` |
| `tokens/spacing.ts` | Padding, gaps, spacing | `paddingX.md`, `paddingY.sm`, `gap.md` |
| `variants/types.ts` | Shared token types | `TextSize`, `Radius`, `TextColor` |

## Token Type Safety

### Defining Tokens with `as const`

All token objects should be defined with `as const` to preserve literal types:

```tsx
// ✅ Good: Define with as const
export const textSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
} as const;

// ❌ Bad: Missing as const
export const textSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  // ...
}; // Types will be 'string' instead of literal 'text-sm'
```

### Centralized Type Definitions

Create and use types from a central location in `src/lib/ui/variants/types.ts`:

```tsx
// src/lib/ui/variants/types.ts
import { textSize, weight } from '@/lib/ui/tokens/typography';
import { textColors } from '@/lib/ui/tokens/text';
import { radii, shadows } from '@/lib/ui/tokens/shape';
import { paddingX, paddingY, gap } from '@/lib/ui/tokens/spacing';

export type TextSize = keyof typeof textSize;
export type Weight = keyof typeof weight;
export type TextColor = keyof typeof textColors;
export type Radius = keyof typeof radii;
export type Shadow = keyof typeof shadows;
export type PaddingX = keyof typeof paddingX;
export type PaddingY = keyof typeof paddingY;
export type Gap = keyof typeof gap;
```

### Using Types in Component Props

```tsx
// ✅ Good: Use imported types
import { TextSize, TextColor, Weight } from '@/lib/ui/variants/types';

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: ReactNode;
  as?: ElementType;
  textSize?: TextSize;
  weight?: Weight;
  color?: TextColor;
  className?: string;
}

// ❌ Bad: Inline prop types
interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  // ...
}
```

## Using Tokens in Components

### When Defining tv() Variants

Always import tokens from their respective files and expand individual keys (don't spread):

```tsx
// ✅ Good: Import tokens and expand individual keys
import { textSize, weight } from '@/lib/ui/tokens/typography';
import { textColors } from '@/lib/ui/tokens/text';
import { radii } from '@/lib/ui/tokens/shape';

const component = tv({
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
    },
    weight: {
      normal: weight.normal,
      medium: weight.medium,
      bold: weight.bold,
    },
    color: {
      default: textColors.default,
      muted: textColors.muted,
    },
    radius: {
      none: radii.none,
      md: radii.md,
      lg: radii.lg,
    }
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
    radius: 'md',
  }
});

// ❌ Bad: Using spread operator or direct reference
const component = tv({
  variants: {
    textSize, // Spreading the entire object
    weight,
    // ...
  }
});

// ❌ Bad: Hardcoded values
const component = tv({
  variants: {
    textSize: {
      sm: 'text-sm',
      base: 'text-base',
    },
    color: {
      default: 'text-gray-900',
      muted: 'text-gray-600',
    }
  }
});
```

### When Using className Directly

Always use token classes over hardcoded Tailwind classes:

```tsx
// ✅ Good: Import and use tokens
import { textColors } from '@/lib/ui/tokens/text';
import { textSize } from '@/lib/ui/tokens/typography';

<div className={cn(textColors.muted, textSize.sm)}>
  Text content
</div>

// ❌ Bad: Hardcoded Tailwind classes
<div className="text-gray-600 text-sm">
  Text content
</div>
```

## Helper Utilities

We've created a helper file at `src/lib/ui/tokenHelpers.ts` that provides convenient access to all tokens, plus some common combinations:

```tsx
import { textStyles, spacingUtils, shapeUtils } from '@/lib/ui/tokenHelpers';

<div className={cn(
  textStyles.bodySmall,
  spacingUtils.paddingMd,
  shapeUtils.roundedLg
)}>
  Content with common token combinations
</div>
```

## ESLint Rule for Detecting Hardcoded Classes

We've added an ESLint rule to help catch hardcoded Tailwind classes:

```js
// .eslintrc.js
module.exports = {
  // ... other config
  rules: {
    // ... other rules
    'no-hardcoded-tailwind-classes': 'warn',
  }
}
```

The rule checks for common patterns like:
- `text-gray-900` → use `textColors.default` instead
- `bg-white` → use `semanticColorMap.background` instead
- `rounded-lg` → use `radii.lg` instead
- `shadow-md` → use `shadows.md` instead

## Detecting Token Drift in Development

You can use the `detectHardcodedClasses` utility function in development to find instances of token drift:

```tsx
import { detectHardcodedClasses } from '@/lib/ui/tokenHelpers';

// In a development utility or testing function
function checkComponent() {
  const className = "text-gray-600 p-4 rounded-lg";
  const driftedTokens = detectHardcodedClasses(className);
  console.warn("Token drift detected:", driftedTokens);
  // Would output: ["text-gray-600", "p-4", "rounded-lg"]
}
```

## Refactoring Existing Components

When refactoring existing components to use the token system:

1. Identify hardcoded Tailwind classes
2. Find the appropriate token from the token files
3. Import the token and use it instead of the hardcoded class
4. For components using variants, update the tv() definition to expand individual token keys
5. Update prop types to use the shared types from `variants/types.ts`

### Example Refactoring

```tsx
// Before
const component = tv({
  variants: {
    size: {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    }
  }
});

// After
import { textSize } from '@/lib/ui/tokens/typography';
import { paddingX, paddingY } from '@/lib/ui/tokens/spacing';
import { TextSize } from '@/lib/ui/variants/types';

const component = tv({
  variants: {
    textSize: {
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
    },
    padding: {
      sm: `${paddingX.sm} ${paddingY.sm}`,
      md: `${paddingX.md} ${paddingY.md}`,
      lg: `${paddingX.lg} ${paddingY.lg}`,
    }
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
  }
});

interface ComponentProps {
  textSize?: TextSize;
  padding?: 'sm' | 'md' | 'lg';
  // Other props...
}
```

## Best Practices

1. **Define tokens with `as const`**: Ensure literal type preservation with the `as const` assertion.

2. **Use centralized types**: Import types from `variants/types.ts` instead of defining inline types.

3. **Expand token keys individually**: Don't spread token objects directly in tv() variants.

4. **Avoid direct token strings**: Don't hardcode token strings like `'text-sm'`. Import them from token files.

5. **Use semantic tokens**: Prefer `textColors.muted` over `'text-gray-600'`.

6. **Split size into textSize and padding**: Don't use combined `size` variants. Use separate `textSize` and `padding` variants.

7. **Document token drift**: When you identify hardcoded values that can't be immediately refactored, add a comment:
   ```tsx
   // ⚠️ Token Drift: Replace with semantic token from tokens/colors.ts
   ```

## Examples of Refactored Components

Here are components that follow the token guidelines:

- `src/components/ui/typography/Text.tsx` - Uses typography and text tokens
- `src/components/ui/typography/Heading.tsx` - Uses typography and text tokens
- `src/examples/CardExample.tsx` - Uses shape and spacing tokens

## Asking for Help

If you're unsure about which token to use, check:

1. The token files in `src/lib/ui/tokens/`
2. The helper utilities in `src/lib/ui/tokenHelpers.ts`
3. The centralized types in `src/lib/ui/variants/types.ts`
4. The component examples mentioned above

Or reach out to the design system team for guidance. 