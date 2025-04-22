<doc id="component-system">

# Component System Guide

<section id="component-overview">

## Overview

Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use the Tailwind Variants (`tv()`) library for styling.

[RULE] Follow the atomic design pattern: core → composed → domain → features.

</section>

<section id="component-organization">

## Component Organization

Components are organized by their level of complexity:
src/components/
├── core/         # Primitive UI elements (Button, Input, Text)
├── composed/     # Combinations of core components (Card, Form)
├── domain/       # Business domain specific components
├── features/     # Complete feature implementations
├── shared/       # Cross-cutting components
└── utility/      # Helper components

[RULE] Place new components in the appropriate directory based on their complexity and purpose.

</section>

<section id="component-tokens">

## Design System Tokens

Our design system uses tokens for consistent styling:

```typescript
// src/lib/ui/tokens.ts
export const colors = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  accent: "text-purple-600",
  danger: "text-red-600",
  // Additional colors...
};

export const typography = {
  textSize: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    // Additional sizes...
  },
  // Additional typography tokens...
};
[RULE] Always use tokens instead of hardcoded values for styling.
</section>
<section id="component-variants">
Tailwind Variants
Components use the tv() utility for creating variants:
typescript// Button.tsx
import { tv } from 'tailwind-variants';
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants';
import { colors } from '@/lib/ui/tokens';

const button = tv({
  base: "inline-flex items-center justify-center font-medium transition-colors",
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding,
    color: colors,
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    color: 'primary',
  }
});

export function Button({ 
  textSize, 
  padding, 
  color, 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={button({ textSize, padding, color, className })}
      {...props}
    />
  );
}
[RULE] Split size into separate textSize and padding variants.
</section>
<section id="component-fields">
Form Fields
Form fields (src/components/core/fields/) include standard inputs as well as specialized components:
Standard Fields

Input: Text, email, password inputs
Select: Dropdown selection
Checkbox: Boolean selection
Textarea: Multi-line text input

Specialized Fields

ReferenceSelect: Asynchronous dropdown using useReferenceOptions

typescript// ReferenceSelect.tsx
export function ReferenceSelect({
  url,
  label,
  value,
  onChange,
  multiple = true,
  disabled = false,
}: ReferenceSelectProps) {
  const { options, error, isLoading } = useReferenceOptions(url);
  
  // Component implementation...
}
[RULE] Use appropriate field components based on the data type and input requirements.
</section>
<section id="component-form">
Form Components
Form components (src/components/composed/forms/) provide consistent form rendering:
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
<section id="component-error-display">
Error Display
Components should display errors in a consistent manner:
tsx// Form field error
{error && (
  <div className="text-sm text-red-500 mt-1">
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