/**
 * Period utility functions for schedule components
 * Centralizes common period operations to eliminate duplication
 */

/**
 * Normalize period numbers for consistent comparison
 * Handles both string and number formats from different sources
 */
export function normalizePeriod(period: string | number): number {
  if (typeof period === 'string') {
    // Extract number from "Period X" format or parse as number
    const match = period.match(/Period (\d+)/)
    return match ? parseInt(match[1], 10) : parseInt(period, 10)
  }
  return period
}

/**
 * Check if two periods match after normalization
 * Useful for period selection validation
 */
export function periodsMatch(period1: string | number, period2: string | number): boolean {
  return normalizePeriod(period1) === normalizePeriod(period2)
}

/**
 * Format period for display
 * Consistent period display across components
 */
export function formatPeriodDisplay(period: string | number): string {
  const normalized = normalizePeriod(period)
  return `Period ${normalized}`
}

/**
 * Validate period range
 * Ensures periods are within reasonable bounds
 */
export function isValidPeriod(period: string | number): boolean {
  const normalized = normalizePeriod(period)
  return !isNaN(normalized) && normalized > 0 && normalized <= 12 // Reasonable period range
}

/**
 * Compare periods for sorting
 * Useful for period ordering in lists
 */
export function comparePeriods(a: string | number, b: string | number): number {
  return normalizePeriod(a) - normalizePeriod(b)
} 