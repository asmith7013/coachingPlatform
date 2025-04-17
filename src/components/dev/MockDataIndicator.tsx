'use client';

import { USE_MOCK_DATA } from '@/lib/dev-utils/useMockData';

/**
 * Development overlay component that shows when mock data is active
 * Only renders in development and when USE_MOCK_DATA is true
 */
export function MockDataIndicator() {
  if (!USE_MOCK_DATA || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
      🧪 Using Mock Data
    </div>
  );
} 