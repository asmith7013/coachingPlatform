/**
 * Server-side CSV generation utilities
 * Core CSV conversion logic for data export functionality
 */

/**
 * Converts an array of objects to CSV format with proper escaping
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[], 
  headers?: string[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Helper function to escape CSV values
  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');
  
  // Create data rows
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeCSVValue(row[header])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Formats data for Google Sheets with custom column mapping
 */
export function formatForGoogleSheets<T extends Record<string, unknown>>(
  data: T[],
  columnMapping: Record<string, string>
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Create mapped data with human-readable headers
  const mappedData = data.map(row => {
    const mappedRow: Record<string, unknown> = {};
    
    Object.entries(columnMapping).forEach(([key, displayName]) => {
      mappedRow[displayName] = row[key];
    });
    
    return mappedRow;
  });

  // Use the display names as headers
  const headers = Object.values(columnMapping);
  
  return convertToCSV(mappedData, headers);
} 