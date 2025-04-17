// 🔄 Toggle this to switch between mock and real data
// 👈 To revert to production data: set USE_MOCK_DATA = false
export const USE_MOCK_DATA = true;

/**
 * Helper to load mock data in actions layer
 * @param mockDataPath Path to mock data file relative to src/lib/mock-data/
 * @returns The mock data if USE_MOCK_DATA is true, undefined otherwise
 */
export const loadMockData = async <T>(mockDataPath: string): Promise<T | undefined> => {
  if (!USE_MOCK_DATA) return undefined;
  
  try {
    // Dynamic import of mock data
    const mockData = await import(`@/lib/mock-data/${mockDataPath}`);
    return mockData.default || mockData;
  } catch (error) {
    console.warn(`Failed to load mock data from ${mockDataPath}:`, error);
    return undefined;
  }
};

/**
 * Type helper for paginated results
 */
export interface PaginatedMockResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Helper to create a paginated result from mock data
 * @param data Full array of mock data
 * @param page Page number (1-based)
 * @param limit Items per page
 * @returns Paginated result matching the structure of your real API
 */
export const createPaginatedMockResult = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginatedMockResult<T> => {
  const start = (page - 1) * limit;
  const paginatedData = data.slice(start, start + limit);

  return {
    data: paginatedData,
    total: data.length,
    page,
    limit,
  };
};

/**
 * Helper to switch between mock and real data fetching
 * @param mockData The mock data to use when USE_MOCK_DATA is true
 * @param realFetcher Function that fetches real data
 * @param useMock Override for USE_MOCK_DATA (optional)
 */
export const useMockData = <T>(
  mockData: T,
  realFetcher: () => Promise<T>,
  useMock = USE_MOCK_DATA
): Promise<T> => {
  return useMock ? Promise.resolve(mockData) : realFetcher();
}; 