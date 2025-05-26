import { z } from 'zod';
/**
 * Custom Zod transformer for date fields
 * Handles string dates by converting them to Date objects
 */
export const zDateField = z.preprocess(
  (val) => (typeof val === 'string' ? new Date(val) : val),
  z.date()
) as z.ZodType<Date, z.ZodTypeDef, string | Date>;

/**
 * Format a date for API responses
 */
export function formatDateForAPI(date: Date | string | undefined): string {
  return formatMediumDate(date);
}


/**
 * Formats a date as a short month/day string
 */
export function formatShortDate(date: Date | string | undefined): string {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a date as a medium month/day/year string
 */
export function formatMediumDate(date: Date | string | undefined): string {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Formats a date as a long weekday/month/day/year string
 */
export function formatLongDate(date: Date | string | undefined): string {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Gets a relative time string (e.g., "2 days ago", "just now")
 */
export function getRelativeTimeString(date: Date | string | undefined): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatMediumDate(date);
}