// This file will contain utility functions used across Monday integration components
// Functions can be extracted from existing components as they are refactored

/**
 * Format a Monday.com user's display name
 */
export function formatMondayUserName(name: string, email?: string): string {
  if (!name && !email) return 'Unknown User';
  if (!name && email) return email;
  if (name && !email) return name;
  return `${name} (${email})`;
} 