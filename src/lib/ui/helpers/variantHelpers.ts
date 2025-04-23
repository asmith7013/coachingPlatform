import { VariantProps } from 'tailwind-variants';

/**
 * Creates a properly typed boolean variant for tailwind-variants
 * that accepts boolean values but converts them to strings for the library
 */
export function booleanVariant(name: string) {
  return {
    [name]: {
      true: '', // Empty string activates the variant
      false: '', // Empty string is used as a placeholder
    },
    defaultVariants: {
      [name]: 'false' // Default as string to avoid TS errors
    }
  };
}

/**
 * Type for extracting variant props with proper boolean handling
 * Converts string 'true'|'false' variants to actual boolean types
 */
export type BooleanVariantProps<C extends (...args: unknown[]) => unknown> = {
  [K in keyof VariantProps<C>]: VariantProps<C>[K] extends 'true' | 'false' 
    ? boolean 
    : VariantProps<C>[K];
};

// ✅ Strongly typed helper for defaultVariants
export const defaultBooleanVariant = (value: boolean) =>
  value ? 'true' as const : 'false' as const; 