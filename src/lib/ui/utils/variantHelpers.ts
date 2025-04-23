/**
 * Creates a boolean variant for tailwind-variants that applies
 * the given classes when the variant is true.
 */
export const booleanVariant = (className: string) => ({
  true: className,
  false: '',
});

// ✅ Strongly typed helper for defaultVariants
export const defaultBooleanVariant = (value: boolean) =>
  value ? 'true' as const : 'false' as const; 