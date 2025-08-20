import { useState, useCallback } from 'react';
import { 
  scrapeIMCooldowns, 
  scrapeIMCooldownsDebug,
  generateIMUrls as generateUrlsAction,
  testSingleURL
} from '../actions/scraper';
import { 
  IMCredentials, 
  IMLesson, 
  IMScrapingResponse, 
  IMUrlGeneration 
} from '../lib/types';

export interface IMScraperState {
  results: IMLesson[];
  isLoading: boolean;
  error: string | null;
  lastResponse: IMScrapingResponse | null;
  isTesting: boolean;
  testResult: {
    lesson?: IMLesson;
    hasContent?: boolean;
    contentSections?: number;
  } | null;
}

export interface IMScraperActions {
  scrapeCustomUrls: (credentials: IMCredentials, urls: string[], delay?: number, enableClaudeExport?: boolean) => Promise<void>;
  scrapeCustomUrlsDebug: (credentials: IMCredentials, urls: string[], delay?: number, enableClaudeExport?: boolean) => Promise<void>;
  generateAndScrapeUrls: (credentials: IMCredentials, params: IMUrlGeneration) => Promise<void>;
  testUrl: (credentials: IMCredentials, url: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: IMScraperState = {
  results: [],
  isLoading: false,
  error: null,
  lastResponse: null,
  isTesting: false,
  testResult: null
};

/**
 * Hook for managing IM scraper state and operations
 * Uses simple React state management (no React Query)
 * Following the pattern established in the project for utility tools
 */
export function useIMScraper(): IMScraperState & IMScraperActions {
  const [state, setState] = useState<IMScraperState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setResults = useCallback((results: IMLesson[], response?: IMScrapingResponse) => {
    setState(prev => ({ 
      ...prev, 
      results, 
      lastResponse: response || null 
    }));
  }, []);

  const scrapeCustomUrls = useCallback(async (
    credentials: IMCredentials, 
    urls: string[], 
    delay: number = 2000,
    enableClaudeExport: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await scrapeIMCooldowns({
        credentials,
        lessonUrls: urls,
        delayBetweenRequests: delay,
        enableClaudeExport
      });
      
      if (response.success && response.data) {
        setResults(response.data.lessons, response.data);
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

  const scrapeCustomUrlsDebug = useCallback(async (
    credentials: IMCredentials, 
    urls: string[], 
    delay: number = 3000,
    enableClaudeExport: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting debug scraping session from hook...');
      const response = await scrapeIMCooldownsDebug({
        credentials,
        lessonUrls: urls,
        delayBetweenRequests: delay,
        enableClaudeExport
      });
      
      if (response.success && response.data) {
        setResults(response.data.lessons, response.data);
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

  const generateAndScrapeUrls = useCallback(async (
    credentials: IMCredentials, 
    params: IMUrlGeneration
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // First generate URLs
      const urlResponse = await generateUrlsAction(params);
      
      if (!urlResponse.success) {
        setError(urlResponse.error || 'Unknown error occurred');
        return;
      }
      
      if (!urlResponse.data) {
        setError('No data received from URL generation');
        return;
      }
      
      const { urls } = urlResponse.data;
      
      // Then scrape the generated URLs
      const scrapeResponse = await scrapeIMCooldowns({
        credentials,
        lessonUrls: urls,
        delayBetweenRequests: 2000
      });
      
      if (scrapeResponse.success && scrapeResponse.data) {
        setResults(scrapeResponse.data.lessons, scrapeResponse.data);
      } else {
        setError(scrapeResponse.error || 'Unknown error occurred');
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



  const testUrl = useCallback(async (credentials: IMCredentials, url: string) => {
    setState(prev => ({ ...prev, isTesting: true, testResult: null }));
    setError(null);
    
    try {
      const response = await testSingleURL({ credentials, url });
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, testResult: response.data }));
      } else {
        setError(response.error || 'Unknown error occurred');
        setState(prev => ({ ...prev, testResult: null }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setState(prev => ({ ...prev, testResult: null }));
    } finally {
      setState(prev => ({ ...prev, isTesting: false }));
    }
  }, [setError]);

  const clearResults = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      results: [], 
      lastResponse: null,
      testResult: null 
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    scrapeCustomUrls,
    scrapeCustomUrlsDebug,
    generateAndScrapeUrls,
    testUrl,
    clearResults,
    clearError,
    reset
  };
}

/**
 * Utility hook for URL generation only (without scraping)
 */
export function useIMUrlGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  const generateUrls = useCallback(async (params: IMUrlGeneration) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await generateUrlsAction(params);
      
      if (response.success && response.data) {
        setGeneratedUrls(response.data.urls);
      } else {
        setError(response.error || 'Unknown error occurred');
        setGeneratedUrls([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setGeneratedUrls([]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearUrls = useCallback(() => {
    setGeneratedUrls([]);
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    generatedUrls,
    generateUrls,
    clearUrls
  };
}
