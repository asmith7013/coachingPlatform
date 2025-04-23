import Papa from 'papaparse';

export function parseCSV(csvContent: string, options = {}) {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header: string) => header.trim()
  };
  
  const result = Papa.parse(csvContent, {
    ...defaultOptions,
    ...options
  });
  
  return result.data;
} 