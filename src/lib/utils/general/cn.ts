import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges multiple class names and tailwind classes together.
 * Uses clsx for conditional classes and twMerge to handle Tailwind class conflicts.
 * 
 * @example cn('px-2 py-1', isActive && 'bg-blue-500', 'text-white')
 * @example cn({'bg-blue-500': isActive, 'bg-gray-200': !isActive}, 'text-white')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 