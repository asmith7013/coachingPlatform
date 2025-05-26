import { NextStep } from "../../zod-schema/look-fors/next-step";

/**
 * Formats a next step description with optional truncation
 */
export function formatNextStepDescription(nextStep: NextStep, maxLength: number = 100): string {
  if (!nextStep.description) return '';
  
  if (nextStep.description.length <= maxLength) {
    return nextStep.description;
  }
  
  return nextStep.description.slice(0, maxLength) + '...';
}

/**
 * Gets a context display string for a next step
 */
export function getNextStepContextDisplay(
  nextStep: NextStep, 
  teacherName?: string, 
  lookForTopic?: string
): string {
  const teacher = teacherName || 'Unknown Teacher';
  const topic = lookForTopic || 'Unknown Look-For';
  
  return `${teacher} - ${topic}`;
}