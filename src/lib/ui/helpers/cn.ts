import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS optimizations.
 * Merges overlapping Tailwind classes properly.
 *
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 