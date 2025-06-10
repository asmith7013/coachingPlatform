// src/lib/data-processing/transformers/purpose-normalizer.ts

import { SessionPurposes } from '@enums';

/**
 * Normalizes session purpose values to match enum casing
 */
export function normalizePurpose(value: string): string {
  const normalizedMap: Record<string, string> = {
    'observation': SessionPurposes.OBSERVATION,
    'debrief': SessionPurposes.DEBRIEF, 
    'co-planning': SessionPurposes.CO_PLANNING,
    'plc': SessionPurposes.PLC,
  };
  
  return normalizedMap[value.toLowerCase()] || value;
}

/**
 * Normalizes purpose values in visit data
 */
export function normalizeVisitPurposes(visit: any): any {
  if (!visit) return visit;
  
  // Normalize events array
  if (Array.isArray(visit.events)) {
    visit.events = visit.events.map((event: any) => ({
      ...event,
      eventType: event.eventType ? normalizePurpose(event.eventType) : event.eventType,
      purpose: event.purpose ? normalizePurpose(event.purpose) : event.purpose,
    }));
  }
  
  return visit;
}
