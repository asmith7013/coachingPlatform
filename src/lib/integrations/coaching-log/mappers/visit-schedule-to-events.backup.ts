import { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';
import { VisitSchedule } from '@zod-schema/schedules/schedule-documents';
import { NYCPSStaff } from '@zod-schema/core/staff';
import { SessionPurposes } from '@enums';

export interface EventData {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

export function visitScheduleToEventData(
  visitSchedule: VisitSchedule | undefined,
  staffLookup: Map<string, NYCPSStaff>
): EventData[] {
  console.log('🔄 Converting VisitSchedule to EventData:', {
    hasSchedule: !!visitSchedule,
    timeBlocksCount: visitSchedule?.timeBlocks?.length || 0,
    staffLookupSize: staffLookup.size
  });

  // Handle missing visitSchedule with single fallback event
  if (!visitSchedule?.timeBlocks?.length) {
    console.log('⚠️ No time blocks found, using fallback event');
    return [{
      name: ["Teacher TBD"],
      role: "Teacher",
      activity: "Observed instruction", 
      duration: "45"
    }];
  }

  // Transform each time block to EventData
  const events = visitSchedule.timeBlocks.map((block, index) => {
    console.log(`🔄 Processing time block ${index + 1}:`, {
      eventType: block.eventType,
      staffIds: block.staffIds,
      portion: block.portion,
      duration: block.duration
    });

    return {
      name: resolveStaffNames(block.staffIds, staffLookup),
      role: resolveStaffRole(block.staffIds[0], staffLookup),
      activity: mapEventTypeToActivity(block.eventType),
      duration: calculateEventDuration(block)
    };
  });

  console.log('✅ Converted to EventData:', events);
  return events;
}

function resolveStaffNames(staffIds: string[], staffLookup: Map<string, NYCPSStaff>): string[] {
  return staffIds.map(id => {
    const staff = staffLookup.get(id);
    if (staff?.staffName) {
      return staff.staffName;
    }
    // Fallback with partial ID for debugging
    return `Staff ${id.slice(-4)}`;
  });
}

function resolveStaffRole(staffId: string, staffLookup: Map<string, NYCPSStaff>): string {
  const staff = staffLookup.get(staffId);
  if (!staff?.rolesNYCPS?.length) return "Teacher";
  
  // Simple mapping - use first role
  const roleMap: Record<string, string> = {
    'Teacher': 'Teacher',
    'Coach': 'School-based coach', 
    'AP': 'School-based admin',
    'Principal': 'School-based admin',
    'Administrator': 'District/Network admin'
  };
  
  return roleMap[staff.rolesNYCPS[0]] || "Teacher";
}

function mapEventTypeToActivity(eventType: string): string {
  const activityMap: Record<string, string> = {
    [SessionPurposes.OBSERVATION]: 'Observed instruction',
    [SessionPurposes.DEBRIEF]: 'Held debrief', 
    [SessionPurposes.CO_PLANNING]: 'Planned for instruction',
    [SessionPurposes.PLC]: 'Analyzed student work'
  };
  
  return activityMap[eventType] || 'Observed instruction';
}

function calculateEventDuration(block: VisitScheduleBlock): string {
  // Use stored duration if available and it's a valid form option
  if (block.duration && isValidFormDuration(block.duration.toString())) {
    return block.duration.toString();
  }
  
  // Default to 45 minutes - most common coaching session length
  return "45";
}

function isValidFormDuration(duration: string): boolean {
  // Form accepts: 15, 30, 45, 60, 76, 90
  const validDurations = ["15", "30", "45", "60", "76", "90"];
  return validDurations.includes(duration);
} 