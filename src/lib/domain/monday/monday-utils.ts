import { format } from 'date-fns';

/**
 * Format a date from Monday's format to our application format
 */
export function formatDateFromMonday(dateStr: string): string {
  try {
    // Handle different Monday date formats
    // This is a simplification - adjust based on actual format
    const date = new Date(dateStr);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error("Error formatting date from Monday:", error);
    return dateStr; // Return original if parsing fails
  }
}

/**
 * Extract text value from Monday column value
 * Monday often returns values in a JSON string format
 */
export function extractTextFromMondayValue(value: string): string {
  if (!value) return '';
  
  try {
    // For text columns, Monday often returns a JSON object
    const parsed = JSON.parse(value);
    return parsed.text || parsed.value || '';
  } catch {
    // If it's not JSON, return as is
    return value;
  }
}

/**
 * Determine if we should import an item based on its status
 */
export function shouldImportItemWithStatus(status: string): boolean {
  // Define which statuses should be imported
  const importableStatuses = ['To Do', 'In Progress', 'Working on it'];
  return importableStatuses.includes(status);
} 