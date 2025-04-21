import useSWR from 'swr';
import { useState, useEffect } from 'react';

type OptionType = {
  value: string;
  label: string;
};

// Define a generic resource item type with common fields
interface ResourceItem {
  _id: string;
  [key: string]: unknown;
  schoolName?: string;
  staffName?: string;
  name?: string;
}

/**
 * Custom hook to fetch reference options from an API endpoint
 * 
 * @param url The API endpoint URL to fetch options from
 * @param searchQuery Optional search query to filter results
 * @returns Array of option objects with value and label
 */
export function useReferenceOptions(url: string, searchQuery: string = ""): OptionType[] {
  const params = new URLSearchParams();
  
  // Only add search param if it's not empty
  if (searchQuery) {
    params.append("search", searchQuery);
  }
  
  params.append("limit", "20");
  
  const fetchUrl = `${url}?${params.toString()}`;
  
  const { data, error } = useSWR(fetchUrl, async (url) => {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Error fetching options: ${res.statusText}`);
    }
    
    return res.json();
  });

  const [options, setOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    if (data?.items) {
      // Attempt to intelligently map items to options based on common field names
      const mappedOptions = data.items.map((item: ResourceItem) => ({
        value: item._id,
        label: item.schoolName || item.staffName || item.name || `ID: ${item._id}`,
      }));
      
      setOptions(mappedOptions);
    }
  }, [data]);

  if (error) {
    console.error("Error in useReferenceOptions:", error);
    return [];
  }

  return options;
} 