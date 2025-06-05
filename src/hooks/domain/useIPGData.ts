import { useMemo } from 'react';
import { 
  getIPGCoreActionOptions, 
  getIPGSubsectionOptions,
  searchIPGOptions,
  type IPGCoreActionReference,
  type IPGSubsectionReference,
  type IPGCoreAction
} from '@transformers/domain/coaching-reference-transformers';
import ipgData from '@/lib/json/ipg.json';

/**
 * Hook for accessing and managing IPG reference data
 * Provides cached access to IPG core actions and subsections with search functionality
 */
export function useIPGData() {
  // Validate and cache core actions
  const coreActions = useMemo(() => {
    try {
      return getIPGCoreActionOptions();
    } catch (error) {
      console.error('Error loading IPG core actions:', error);
      return [];
    }
  }, []);

  // Cache all subsections
  const allSubsections = useMemo(() => {
    try {
      return getIPGSubsectionOptions();
    } catch (error) {
      console.error('Error loading IPG subsections:', error);
      return [];
    }
  }, []);

  // Function to get subsections for a specific core action
  const getSubsectionsForCoreAction = useMemo(() => {
    return (coreActionNumber: number): IPGSubsectionReference[] => {
      try {
        return getIPGSubsectionOptions(coreActionNumber);
      } catch (error) {
        console.error(`Error loading subsections for core action ${coreActionNumber}:`, error);
        return [];
      }
    };
  }, []);

  // Search function
  const searchIPG = useMemo(() => {
    return (query: string) => {
      try {
        return searchIPGOptions(query);
      } catch (error) {
        console.error('Error searching IPG data:', error);
        return { coreActions: [], subsections: [] };
      }
    };
  }, []);

  // Data validation
  const isDataValid = useMemo(() => {
    const rawData = ipgData as IPGCoreAction[];
    
    // Check basic structure
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return false;
    }

    // Validate each core action
    return rawData.every(ca => {
      return (
        typeof ca.coreAction === 'number' &&
        typeof ca.title === 'string' &&
        Array.isArray(ca.sections) &&
        ca.sections.length > 0 &&
        ca.sections.every(section => 
          typeof section.section === 'string' &&
          typeof section.description === 'string'
        )
      );
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalCoreActions: coreActions.length,
      totalSubsections: allSubsections.length,
      subsectionsByCore: coreActions.reduce((acc, ca) => {
        acc[ca.coreActionNumber] = getSubsectionsForCoreAction(ca.coreActionNumber).length;
        return acc;
      }, {} as Record<number, number>)
    };
  }, [coreActions, allSubsections, getSubsectionsForCoreAction]);

  // Helper functions
  const getCoreActionById = useMemo(() => {
    return (id: string): IPGCoreActionReference | undefined => {
      return coreActions.find(ca => ca._id === id || ca.value === id);
    };
  }, [coreActions]);

  const getSubsectionById = useMemo(() => {
    return (id: string): IPGSubsectionReference | undefined => {
      return allSubsections.find(sub => sub._id === id || sub.value === id);
    };
  }, [allSubsections]);

  const getCoreActionByNumber = useMemo(() => {
    return (coreActionNumber: number): IPGCoreActionReference | undefined => {
      return coreActions.find(ca => ca.coreActionNumber === coreActionNumber);
    };
  }, [coreActions]);

  // Color mapping helper
  const getColorForCoreAction = useMemo(() => {
    return (coreActionNumber: number): 'primary' | 'secondary' | 'success' => {
      switch (coreActionNumber) {
        case 1: return 'primary';
        case 2: return 'secondary';
        case 3: return 'success';
        default: return 'primary';
      }
    };
  }, []);

  return {
    // Data
    coreActions,
    allSubsections,
    
    // Functions
    getSubsectionsForCoreAction,
    searchIPG,
    getCoreActionById,
    getSubsectionById,
    getCoreActionByNumber,
    getColorForCoreAction,
    
    // Validation and stats
    isDataValid,
    stats,
    
    // Loading state (always false since data is static)
    isLoading: false,
    error: isDataValid ? null : new Error('IPG data validation failed')
  };
}

/**
 * Hook for getting options formatted for Select components
 */
export function useIPGSelectOptions() {
  const { coreActions, getSubsectionsForCoreAction } = useIPGData();

  const coreActionOptions = useMemo(() => {
    return coreActions.map(ca => ({
      value: ca.value,
      label: ca.label
    }));
  }, [coreActions]);

  const getSubsectionOptions = useMemo(() => {
    return (coreActionNumber?: number) => {
      const subsections = coreActionNumber 
        ? getSubsectionsForCoreAction(coreActionNumber)
        : [];
      
      return subsections.map(sub => ({
        value: sub.value,
        label: sub.label
      }));
    };
  }, [getSubsectionsForCoreAction]);

  return {
    coreActionOptions,
    getSubsectionOptions
  };
}

/**
 * Hook for IPG data with search capabilities
 */
export function useIPGSearch(initialQuery = '') {
  const { searchIPG } = useIPGData();
  
  const searchResults = useMemo(() => {
    if (!initialQuery.trim()) {
      return { coreActions: [], subsections: [] };
    }
    return searchIPG(initialQuery);
  }, [searchIPG, initialQuery]);

  return {
    searchResults,
    search: searchIPG
  };
} 