import { clsx, type ClassValue } from "clsx";

/**
 * Utility function for composing class names
 * Handles conditional classes and undefined/falsy values
 * Compatible with Tailwind class composition
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}