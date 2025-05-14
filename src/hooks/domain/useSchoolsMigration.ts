import { getFeatureFlags } from '@config/feature-flags';
import { useSchools } from './useSchools';
import { useSchoolsRQ } from './useSchoolsRQ';

/**
 * Migration wrapper that provides a consistent interface
 * while switching between SWR and React Query implementations
 */
export function useSchoolsData(initialPage: number = 1, initialLimit: number = 20) {
  const { useReactQueryForSchools } = getFeatureFlags();
  
  if (useReactQueryForSchools) {
    return useSchoolsRQ(initialPage, initialLimit);
  }
  
  return useSchools(initialPage, initialLimit);
}

// Export the wrapped version as the new default
export { useSchoolsData as useSchools }; 