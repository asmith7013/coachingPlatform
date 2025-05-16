// src/lib/query/utilities/feature-flags.ts
import { getFeatureFlags } from '@/lib/config/feature-flags';

/**
 * Check if React Query should be used for a specific feature
 * 
 * @param feature The specific entity type or feature
 * @returns Whether React Query should be used
 */
export function useReactQuery(feature?: string): boolean {
  const flags = getFeatureFlags();
  
  // If no specific feature, check if any React Query flag is enabled
  if (!feature) {
    return Object.entries(flags)
      .some(([key, value]) => key.startsWith('useReactQueryFor') && value);
  }
  
  // Map the feature name to the corresponding flag
  const flagMapping: Record<string, keyof typeof flags> = {
    'schools': 'useReactQueryForSchools',
    'rubrics': 'useReactQueryForRubrics',
    'staff': 'useReactQueryForStaff',
    'visits': 'useReactQueryForVisits',
    'schedules': 'useReactQueryForSchedules',
    'lookFors': 'useReactQueryForLookFors',
    'cycles': 'useReactQueryForCycles',
  };
  
  // Check the specific flag
  const flagName = flagMapping[feature.toLowerCase()];
  
  if (!flagName) {
    console.warn(`No feature flag mapping defined for "${feature}"`);
    return false;
  }
  
  return flags[flagName];
}

/**
 * Get the entity types that are enabled for React Query
 * 
 * @returns Array of enabled entity types
 */
export function getEnabledReactQueryFeatures(): string[] {
  const flags = getFeatureFlags();
  const enabledFeatures: string[] = [];
  
  if (flags.useReactQueryForSchools) enabledFeatures.push('schools');
  if (flags.useReactQueryForRubrics) enabledFeatures.push('rubrics');
  if (flags.useReactQueryForStaff) enabledFeatures.push('staff');
  if (flags.useReactQueryForVisits) enabledFeatures.push('visits');
  if (flags.useReactQueryForSchedules) enabledFeatures.push('schedules');
  if (flags.useReactQueryForLookFors) enabledFeatures.push('lookFors');
  if (flags.useReactQueryForCycles) enabledFeatures.push('cycles');
  
  return enabledFeatures;
}