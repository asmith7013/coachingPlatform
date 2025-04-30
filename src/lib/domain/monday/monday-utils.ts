import { format } from 'date-fns';
import { MondayItem } from '@/lib/types/domain/monday';

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
    
    // Handle different Monday.com column types
    if (parsed.text) return parsed.text;
    if (parsed.name) return parsed.name;
    if (parsed.value) return parsed.value;
    if (parsed.date) return parsed.date;
    if (parsed.email) return parsed.email;
    
    // For arrays (like multiple people in a person column)
    if (Array.isArray(parsed.personsAndTeams)) {
      return parsed.personsAndTeams.map((p: { name: string }) => p.name).join(", ");
    }
    
    return String(parsed);
  } catch {
    // If it's not JSON, return as is
    return value;
  }
}

/**
 * Determine if we should import an item based on its status
 */
export function shouldImportItemWithStatus(status?: string): boolean {
  if (!status) return true; // Default to true if no status
  
  const importableStatuses = [
    "Active", 
    "Done", 
    "Complete", 
    "Completed", 
    "In Progress",
    "Scheduled",
    "Ready",
    "To Do", 
    "Working on it"
  ];
  
  return importableStatuses.some(s => 
    status.toLowerCase().includes(s.toLowerCase())
  );
}

/**
 * Get column value by ID from a Monday item
 */
export function getColumnValueById(item: MondayItem, columnId: string): string {
  const column = item.column_values.find(col => col.id === columnId);
  return column?.text || "";
} 