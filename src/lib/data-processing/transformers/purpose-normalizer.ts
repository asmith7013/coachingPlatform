// src/lib/data-processing/transformers/purpose-normalizer.ts

import { SessionPurposes } from '@enums';
import { Visit } from '@zod-schema/visits/visit';
import type { Event } from '@/lib/schema/zod-schema/schedules/schedule';

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
export function normalizeVisitPurposes(visit: Visit): Visit {
  if (!visit) return visit;
  
  // Normalize events array
  if (Array.isArray(visit.events)) {
    visit.events = visit.events.map((event: Event) => ({
      ...event,
      eventType: event.eventType ? normalizePurpose(event.eventType) : event.eventType,
      purpose: event.eventType ? normalizePurpose(event.eventType) : event.eventType,
    }));
  }
  
  return visit;
}
