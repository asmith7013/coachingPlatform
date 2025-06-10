import { Visit } from "@zod-schema/visits/visit";
import { formatMediumDate, toDateString } from '@/lib/data-processing/transformers/utils/date-utils';

// Helper function for visit display string
export function getVisitDisplayString(visit: Visit): string {
    if (!visit.date) return 'No date set';
    const dateStr = formatVisitDate(visit.date);
    return visit.allowedPurpose ? `${dateStr} - ${visit.allowedPurpose}` : dateStr;
  }
  
  // Helper function for visit status
  export function getVisitStatus(visit: Visit): string {
    if (visit.modeDone) return visit.modeDone;
    if (visit.events?.length) return 'In Progress';
    return 'Scheduled';
  }

  // Helper function for consistent date formatting
export function formatVisitDate(date: Date | string | undefined): string {
  if (!date) return 'No date set';
  
  const dateString = date instanceof Date 
    ? toDateString(date)
    : date;
    
  return formatMediumDate(dateString);
}