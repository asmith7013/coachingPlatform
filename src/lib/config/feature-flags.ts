export interface FeatureFlags {
  useReactQueryForSchools: boolean;
  useReactQueryForRubrics: boolean;
  useReactQueryForStaff: boolean;
  useReactQueryForVisits: boolean;
  useReactQueryForSchedules: boolean;
  useReactQueryForLookFors: boolean;
  useReactQueryForCycles: boolean;
}

const defaultFlags: FeatureFlags = {
  useReactQueryForSchools: false,
  useReactQueryForRubrics: false,
  useReactQueryForStaff: false,
  useReactQueryForVisits: false,
  useReactQueryForSchedules: false,
  useReactQueryForLookFors: false,
  useReactQueryForCycles: false,
};

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    return {
      useReactQueryForSchools: process.env.NEXT_PUBLIC_USE_RQ_SCHOOLS === 'true',
      useReactQueryForRubrics: process.env.NEXT_PUBLIC_USE_RQ_RUBRICS === 'true',
      useReactQueryForStaff: process.env.NEXT_PUBLIC_USE_RQ_STAFF === 'true',
      useReactQueryForVisits: process.env.NEXT_PUBLIC_USE_RQ_VISITS === 'true',
      useReactQueryForSchedules: process.env.NEXT_PUBLIC_USE_RQ_SCHEDULES === 'true',
      useReactQueryForLookFors: process.env.NEXT_PUBLIC_USE_RQ_LOOKFORS === 'true',
      useReactQueryForCycles: process.env.NEXT_PUBLIC_USE_RQ_CYCLES === 'true',
    };
  }
  
  try {
    const localOverrides = JSON.parse(
      localStorage.getItem('featureFlags') || '{}'
    );
    
    return {
      ...defaultFlags,
      ...localOverrides,
    };
  } catch (error) {
    console.error('Failed to parse feature flags from localStorage:', error);
    return defaultFlags;
  }
}

export function setFeatureFlag(flag: keyof FeatureFlags, value: boolean) {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getFeatureFlags();
    const updated = { ...current, [flag]: value };
    localStorage.setItem('featureFlags', JSON.stringify(updated));
    window.location.reload();
  } catch (error) {
    console.error('Failed to save feature flag:', error);
  }
} 