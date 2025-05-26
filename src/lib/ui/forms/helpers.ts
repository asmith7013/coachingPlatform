import { FieldOverride, FieldOverrideMap } from '@ui-types/form';

/**
 * Extracts and validates the props needed for a ReferenceSelect component from a field override
 * 
 * @param override The field override configuration
 * @returns Props to be spread into the URLReferenceSelect component
 * @throws Error if the override is missing required properties
 */
export function getReferenceSelectProps(override: FieldOverride) {
  // Validate that this is a reference type
  if (override.type !== 'reference') {
    throw new Error(`Expected override type 'reference', got '${override.type}'`);
  }

  // Validate that URL is present for URLReferenceSelect
  if (!override.url) {
    throw new Error('URL is required for reference fields with URLReferenceSelect');
  }

  // Return just the props needed for URLReferenceSelect
  return {
    label: override.label || 'Select...',
    url: override.url,
    disabled: override.disabled === true,
  };
}

/**
 * Gets reference select props from a field override map for a specific field
 */
export function getReferenceSelectPropsForField<T>(
  overrides: FieldOverrideMap<T>, 
  fieldName: keyof T
) {
  const override = overrides[fieldName];
  
  if (!override) {
    throw new Error(`No override found for field ${String(fieldName)}`);
  }
  
  return getReferenceSelectProps(override);
} 