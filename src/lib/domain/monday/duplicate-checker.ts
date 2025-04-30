import { VisitInput } from "@zod-schema/visits/visit";

/**
 * Checks for potential duplicate visits in the database
 * 
 * This is used during the Monday.com import process to flag potential duplicate
 * data before it's imported into the system.
 */

/**
 * Check for exact MondayItem ID matches (already imported)
 */
export async function findExistingMondayItemImports(
  _mondayItemIds: string[]
): Promise<Record<string, string>> {
  const duplicates: Record<string, string> = {};
  
  // Implementation would use your database access layer
  // This is a placeholder for the actual implementation
  // Example pseudocode:
  // 
  // const existingItems = await VisitModel.find({
  //   mondayItemId: { $in: mondayItemIds }
  // });
  // 
  // for (const item of existingItems) {
  //   duplicates[item.mondayItemId] = `Already imported as Visit ID: ${item._id}`;
  // }
  
  return duplicates;
}

/**
 * Check for potential duplicate visits based on date + school + coach
 * This identifies visits that might be duplicates even if they come from different sources
 */
export async function findPotentialVisitDuplicates(
  _visits: Array<Partial<VisitInput>>
): Promise<Record<string, string>> {
  const duplicates: Record<string, string> = {};
  
  // Implementation would use your database access layer
  // This is a placeholder for the actual implementation
  // Example pseudocode:
  // 
  // for (const visit of visits) {
  //   if (!visit.date || !visit.school || !visit.coach) continue;
  //   
  //   const potentialDuplicates = await VisitModel.find({
  //     date: visit.date,
  //     school: visit.school,
  //     coach: visit.coach,
  //     mondayItemId: { $ne: visit.mondayItemId } // Not the same Monday item
  //   });
  //   
  //   if (potentialDuplicates.length > 0) {
  //     duplicates[visit.mondayItemId || getUniqueKey(visit)] = 
  //       `Potential duplicate of Visit ID: ${potentialDuplicates[0]._id}`;
  //   }
  // }
  
  return duplicates;
}

/**
 * Create a unique key for a visit based on its core properties
 * Useful for identifying visits without an ID
 */
export function getUniqueVisitKey(visit: Partial<VisitInput>): string {
  // Check if date is a Date object and format it, otherwise use as string
  let dateStr = 'unknown-date';
  if (visit.date) {
    // Type-safe check for Date object
    if (typeof visit.date === 'object' && 
        visit.date !== null && 
        typeof (visit.date as { toISOString?: () => string }).toISOString === 'function') {
      dateStr = (visit.date as Date).toISOString().split('T')[0];
    } else {
      dateStr = String(visit.date);
    }
  }
  
  const school = visit.school || 'unknown-school';
  const coach = visit.coach || 'unknown-coach';
  
  return `${dateStr}-${school}-${coach}`;
}

/**
 * Combines all duplicate checking methods into a single function
 */
export async function findAllDuplicateVisits(
  visits: Array<Partial<VisitInput>>
): Promise<Record<string, string>> {
  // Get all Monday item IDs
  const mondayItemIds = visits
    .map(v => v.mondayItemId)
    .filter(Boolean) as string[];
  
  // Check for exact imports first
  const exactDuplicates = await findExistingMondayItemImports(mondayItemIds);
  
  // Then check for potential duplicates based on core fields
  const potentialDuplicates = await findPotentialVisitDuplicates(visits);
  
  // Combine the results
  return {
    ...exactDuplicates,
    ...potentialDuplicates
  };
} 