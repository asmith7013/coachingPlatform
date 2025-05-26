import { Visit } from "@zod-schema/visits/visit";

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
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }