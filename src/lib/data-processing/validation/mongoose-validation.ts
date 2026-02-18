import { Types } from "mongoose";

/**
 * Validate if a string is a valid MongoDB ObjectId
 *
 * @param id The string to validate
 * @returns true if the string is a valid ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate multiple ObjectIds
 *
 * @param ids Array of strings to validate
 * @returns true if all strings are valid ObjectIds
 */
export function areValidObjectIds(ids: string[]): boolean {
  return ids.every((id) => isValidObjectId(id));
}

/**
 * Filter out invalid ObjectIds from an array
 *
 * @param ids Array of strings to filter
 * @returns Array containing only valid ObjectIds
 */
export function filterValidObjectIds(ids: string[]): string[] {
  return ids.filter((id) => isValidObjectId(id));
}
