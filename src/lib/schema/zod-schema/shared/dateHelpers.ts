// src/lib/data-schema/zod-schema/shared/dateHelpers.ts
import { z } from 'zod';

// Re-export date utilities for consistency
export {
  getTodayString,
  toDateString,
  fromDateString,
  formatShortDate,
  formatMediumDate,
  formatLongDate,
  formatDateForAPI,
  getDayNameFromDate,
  getDayTypeFromDate,
  isSameDay,
  isToday,
  navigateDate,
  navigateWeek,
  navigateMonth,
  addDays,
  subtractDays,
  getRelativeDateDescription
} from '@/lib/data-processing/transformers/utils/date-utils';

/**
 * Enhanced date field transformer that handles various date formats
 * including strings, Date objects, and timestamps
 */
export const zDateField = z.preprocess(
  (val) => {
    // Handle existing Date objects
    if (val instanceof Date) {
      return val;
    }
    
    // Handle string date formats
    if (typeof val === 'string' && val.trim() !== '') {
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle timestamps (numbers)
    if (typeof val === 'number') {
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle MongoDB extended JSON format
    if (val && typeof val === 'object' && '$date' in val) {
      const date = new Date(val.$date as string);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  },
  z.date().nullable()
).transform(val => val || undefined);

/**
 * Schema for validating ISO date strings only
 */
export const isoDateStringSchema = z
  .string()
  .refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid ISO date string format"
  });

/**
 * Schema for validating YYYY-MM-DD date strings
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "Date must be in YYYY-MM-DD format" 
  })
  .refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date"
  });

/**
 * Zod schema for optional Date objects
 */
export const zOptionalDateField = z.date().optional();