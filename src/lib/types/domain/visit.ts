import { SessionPurposes } from '@/lib/schema/enum';
// Re-export core visit types from the schema
export type {
    Visit,
    VisitInput,
    EventItem,
    SessionLink
  } from '@zod-schema/visits/visit';
  
  // Re-export coaching log types
  export type {
    CoachingLog,
    CoachingLogInput
  } from '@zod-schema/visits/coaching-log';


  // Additional visit-related types
  export type VisitType = 
    | SessionPurposes.OBSERVATION 
    | SessionPurposes.DEBRIEF 
    | SessionPurposes.CO_PLANNING 
    | SessionPurposes.PLC;
  
  export interface VisitFilters {
    school?: string;
    coach?: string;
    startDate?: string;
    endDate?: string;
    type?: VisitType;
    gradeLevels?: string[];
  }
  

  /**
   * Helper function to determine if a visit is complete
   */
  // export function isVisitComplete(visit: Pick<import('@zod-schema/visits/visit').Visit, 'events' | 'sessionLinks'>): boolean {
  //   const hasEvents = visit.events && visit.events.length > 0;
  //   const hasSessionLinks = visit.sessionLinks && visit.sessionLinks.length > 0;
    
  //   return hasEvents || hasSessionLinks;
  // }