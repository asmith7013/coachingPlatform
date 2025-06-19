import { scheduleColors } from '@/lib/tokens/colors';

/**
 * Styling helpers for schedule components
 * Now uses direct design tokens for consistent styling
 */

// =====================================
// EVENT STYLING HELPERS
// =====================================

/**
 * Gets event styling classes - simple direct token lookup
 */
export const getEventStyling = (eventType: string) => {
  const eventMap = {
    observation: { className: scheduleColors.observation, label: 'Observation' },
    debrief: { className: scheduleColors.debrief, label: 'Debrief' },
    'co-planning': { className: scheduleColors.coPlanning, label: 'Co-Planning' },
    plc: { className: scheduleColors.plc, label: 'PLC' }
  } as const;
  
  return eventMap[eventType as keyof typeof eventMap] || 
         { className: scheduleColors.observation, label: 'Visit' };
};

// =====================================
// PORTION STYLING HELPERS  
// =====================================

// =====================================
// CELL STYLING HELPERS
// =====================================

/**
 * Gets teacher cell styling - simple direct token lookup
 */
export const getTeacherCellStyle = (isSelected: boolean, activityType?: string) => {
  // Lunch period
  if (activityType === 'lunch') {
    return isSelected ? scheduleColors.selected : scheduleColors.lunch;
  }
  
  // Prep period
  if (activityType === 'prep') {
    return isSelected ? scheduleColors.selected : scheduleColors.prep;
  }
  
  // Regular period
  return isSelected ? scheduleColors.selected : scheduleColors.available;
};

// =====================================
// PLANNING STATUS HELPERS
// =====================================

/**
 * Gets planning icon styling - simple direct token lookup
 */
export const getPlanningIconStyle = (isPlanned: boolean, iconType: 'observation' | 'meeting') => {
  if (iconType === 'observation') {
    return isPlanned ? scheduleColors.observation : scheduleColors.observation;
  }
  
  return isPlanned ? scheduleColors.debrief : scheduleColors.debrief;
}; 