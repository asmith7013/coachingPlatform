/**
 * Consolidated Date Utilities
 * 
 * Single source of truth for all date operations across the application.
 * Handles timezone safety, consistent formatting, and common date operations.
 */

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 * Replaces: new Date().toISOString().split('T')[0]
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert Date object to YYYY-MM-DD string in local timezone
 * Safe alternative to toISOString() which uses UTC
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date object in local timezone
 * Safe alternative to new Date(string) which can be timezone-dependent
 */
export function fromDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Navigate date by direction (prev/next/today)
 * Replaces complex date navigation logic
 */
export function navigateDate(currentDate: string, direction: 'prev' | 'next' | 'today'): string {
  if (direction === 'today') {
    return getTodayString();
  }
  
  const date = fromDateString(currentDate);
  
  if (direction === 'prev') {
    date.setDate(date.getDate() - 1);
  } else if (direction === 'next') {
    date.setDate(date.getDate() + 1);
  }
  
  return toDateString(date);
}

/**
 * Navigate week by direction
 * For weekly calendar navigation
 */
export function navigateWeek(currentDate: string, direction: 'prev' | 'next' | 'today'): string {
  if (direction === 'today') {
    return getTodayString();
  }
  
  const date = fromDateString(currentDate);
  
  if (direction === 'prev') {
    date.setDate(date.getDate() - 7);
  } else if (direction === 'next') {
    date.setDate(date.getDate() + 7);
  }
  
  return toDateString(date);
}

/**
 * Navigate month by direction
 * For monthly calendar navigation
 */
export function navigateMonth(currentDate: string, direction: 'prev' | 'next' | 'today'): string {
  if (direction === 'today') {
    return getTodayString();
  }
  
  const date = fromDateString(currentDate);
  
  if (direction === 'prev') {
    date.setMonth(date.getMonth() - 1);
  } else if (direction === 'next') {
    date.setMonth(date.getMonth() + 1);
  }
  
  return toDateString(date);
}

/**
 * Format date as short format: "Mon 15"
 * Now supports both Date objects and strings
 */
export function formatShortDate(dateString: string): string {
  const date = fromDateString(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format date as medium format: "Mon 15, 2024"
 * Replaces: toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
 */
export function formatMediumDate(dateString: string): string {
  const date = fromDateString(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format date as long format: "Monday, January 15, 2024"
 * Replaces: toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
 */
export function formatLongDate(dateString: string): string {
  const date = fromDateString(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Format date for API calls (ISO format)
 * Replaces: new Date().toISOString()
 */
export function formatDateForAPI(dateString: string): string {
  const date = fromDateString(dateString);
  return date.toISOString();
}

/**
 * Get day name from date string
 * Returns lowercase day name: 'monday', 'tuesday', etc.
 */
export function getDayNameFromDate(dateString: string): string {
  const date = fromDateString(dateString);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Get day type from date string for bell schedules
 * Returns formatted day name for schedule matching
 */
export function getDayTypeFromDate(dateString: string): string {
  const date = fromDateString(dateString);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  return dayName.toLowerCase();
}

/**
 * Check if two date strings represent the same day
 * Safe comparison for YYYY-MM-DD strings
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Check if date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

/**
 * Get start of week (Sunday) for a given date
 */
export function getWeekStart(dateString: string): string {
  const date = fromDateString(dateString);
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  return toDateString(startOfWeek);
}

/**
 * Get end of week (Saturday) for a given date
 */
export function getWeekEnd(dateString: string): string {
  const date = fromDateString(dateString);
  const dayOfWeek = date.getDay();
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (6 - dayOfWeek));
  return toDateString(endOfWeek);
}

/**
 * Get array of dates for a week starting from given date
 */
export function getWeekDates(startDate: string): string[] {
  const dates: string[] = [];
  const start = fromDateString(startDate);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(toDateString(date));
  }
  
  return dates;
}

/**
 * Add days to a date string
 */
export function addDays(dateString: string, days: number): string {
  const date = fromDateString(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/**
 * Subtract days from a date string
 */
export function subtractDays(dateString: string, days: number): string {
  return addDays(dateString, -days);
}

/**
 * Get relative date description: "Today", "Yesterday", "Tomorrow", or formatted date
 */
export function getRelativeDateDescription(dateString: string): string {
  const today = getTodayString();
  const yesterday = subtractDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';
  if (dateString === tomorrow) return 'Tomorrow';
  
  return formatMediumDate(dateString);
}