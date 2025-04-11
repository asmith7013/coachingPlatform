export const booleanVariant = (trueClass: string, falseClass = '') =>
  ({ 'true': trueClass, 'false': falseClass } as Record<'true' | 'false', string>);

// ✅ Strongly typed helper for defaultVariants
export const defaultBooleanVariant = (value: boolean) =>
  value ? 'true' as const : 'false' as const; 