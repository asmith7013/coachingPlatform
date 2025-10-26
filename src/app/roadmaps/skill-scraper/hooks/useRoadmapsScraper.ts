import { useState, useCallback } from 'react';
import { 
  scrapeRoadmapsSkills, 
  scrapeRoadmapsSkillsDebug,
  validateRoadmapsCredentials
} from '../actions/scrape-skills';
import { 
  RoadmapsCredentials, 
  SkillData, 
  RoadmapsScrapingResponse 
} from '../lib/types';

export interface RoadmapsScraperState {
  results: SkillData[];
  isLoading: boolean;
  error: string | null;
  lastResponse: RoadmapsScrapingResponse | null;
  isValidating: boolean;
  validationResult: {
    authenticated?: boolean;
    message?: string;
  } | null;
}

export interface RoadmapsScraperActions {
  scrapeSkills: (credentials: RoadmapsCredentials, urls: string[], delay?: number) => Promise<void>;
  scrapeSkillsDebug: (credentials: RoadmapsCredentials, urls: string[], delay?: number) => Promise<void>;
  validateCredentials: (credentials: RoadmapsCredentials) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: RoadmapsScraperState = {
  results: [],
  isLoading: false,
  error: null,
  lastResponse: null,
  isValidating: false,
  validationResult: null
};

/**
 * Hook for managing Roadmaps scraper state and operations
 * Follows the exact pattern from useIMScraper for consistency
 */
export function useRoadmapsScraper(): RoadmapsScraperState & RoadmapsScraperActions {
  const [state, setState] = useState<RoadmapsScraperState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setResults = useCallback((results: SkillData[], response?: RoadmapsScrapingResponse) => {
    setState(prev => ({ 
      ...prev, 
      results, 
      lastResponse: response || null 
    }));
  }, []);

  const setValidating = useCallback((validating: boolean) => {
    setState(prev => ({ ...prev, isValidating: validating }));
  }, []);

  const setValidationResult = useCallback((result: { authenticated?: boolean; message?: string } | null) => {
    setState(prev => ({ ...prev, validationResult: result }));
  }, []);

  const scrapeSkills = useCallback(async (
    credentials: RoadmapsCredentials, 
    urls: string[], 
    delay: number = 2000
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await scrapeRoadmapsSkills({
        credentials,
        skillUrls: urls,
        delayBetweenRequests: delay
      });
      
      if (response.success && response.data) {
        setResults(response.data.skills, response.data);
      } else {
        setError(response.error || 'Unknown error occurred');
        setResults([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults]);

  const scrapeSkillsDebug = useCallback(async (
    credentials: RoadmapsCredentials, 
    urls: string[], 
    delay: number = 3000
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting debug scraping session from hook...');
      const response = await scrapeRoadmapsSkillsDebug({
        credentials,
        skillUrls: urls,
        delayBetweenRequests: delay
      });
      
      if (response.success && response.data) {
        setResults(response.data.skills, response.data);
        console.log('✅ Debug scraping completed successfully');
      } else {
        setError(response.error || 'Unknown error occurred');
        setResults([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Debug scraping error:', err);
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults]);

  const validateCredentials = useCallback(async (credentials: RoadmapsCredentials) => {
    setValidating(true);
    setError(null);
    setValidationResult(null);
    
    try {
      const response = await validateRoadmapsCredentials(credentials);
      
      if (response.success && response.data) {
        setValidationResult(response.data);
        
        // If validation failed, also set it as an error
        if (!response.data.authenticated) {
          setError(response.data.message || 'Credential validation failed');
        }
      } else {
        setError(response.error || 'Unknown error occurred during validation');
        setValidationResult(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  }, [setValidating, setError, setValidationResult]);

  const clearResults = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      results: [], 
      lastResponse: null 
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setValidationResult(null);
  }, [setError, setValidationResult]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    scrapeSkills,
    scrapeSkillsDebug,
    validateCredentials,
    clearResults,
    clearError,
    reset
  };
}
