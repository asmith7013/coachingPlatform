import { NextRequest } from 'next/server';
import { withStandardResponse } from '@/lib/server-utils/standardizeResponse';

type ExampleItem = {
  id: string;
  name: string;
};

type ExampleResponse = {
  items: ExampleItem[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Example API route that demonstrates using withStandardResponse
 * to standardize response format
 */
export const GET = withStandardResponse<ExampleResponse, [NextRequest]>(
  async (request: NextRequest) => {
    try {
      // Get search parameters
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      
      // Sample data - this would normally come from a database
      const sampleItems: ExampleItem[] = [
        { id: '1', name: 'Example 1' },
        { id: '2', name: 'Example 2' },
        { id: '3', name: 'Example 3' },
        { id: '4', name: 'Sample 4' },
        { id: '5', name: 'Sample 5' },
      ];
      
      // Filter based on search query
      const filteredItems = search
        ? sampleItems.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase())
          )
        : sampleItems;
      
      // Return data - withStandardResponse will format it
      return {
        items: filteredItems,
        total: filteredItems.length,
        page: 1,
        limit: 10
      };
    } catch (error) {
      // Log error and let withStandardResponse handle it
      console.error('API error:', error);
      throw error;
    }
  }
); 