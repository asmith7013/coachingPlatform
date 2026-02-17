import { VisitScheduleBlock } from "@zod-schema/schedules/schedule-events";
import { VisitSchedule } from "@zod-schema/schedules/schedule-documents";
import { NYCPSStaff } from "@zod-schema/core/staff";
import { SessionPurposes } from "@enums";

export interface EventData {
  name: string[];
  role: string;
  activity: string;
  duration: string;
}

export function visitScheduleToEventData(
  visitSchedule: VisitSchedule | undefined,
  staffLookup: Map<string, NYCPSStaff>,
): EventData[] {
  console.log("🔄 Converting VisitSchedule to EventData:", {
    hasSchedule: !!visitSchedule,
    timeBlocksCount: visitSchedule?.timeBlocks?.length || 0,
    staffLookupSize: staffLookup.size,
    staffLookupEntries: Array.from(staffLookup.entries()).map(
      ([id, staff]) => ({
        id,
        name: staff.staffName,
      }),
    ),
  });

  if (!visitSchedule?.timeBlocks?.length) {
    console.log("⚠️ No time blocks found, using fallback event");
    return [
      {
        name: ["Teacher TBD"],
        role: "Teacher",
        activity: "Observed instruction",
        duration: "45",
      },
    ];
  }

  const events = visitSchedule.timeBlocks.map((block, index) => {
    console.log(`🔄 Processing time block ${index + 1}:`, {
      eventType: block.eventType,
      staffIds: block.staffIds,
      portion: block.portion,
      duration: block.duration,
    });

    return {
      name: resolveStaffNames(block.staffIds, staffLookup),
      role: resolveStaffRole(block.staffIds[0], staffLookup),
      activity: mapEventTypeToActivity(block.eventType),
      duration: calculateEventDuration(block),
    };
  });

  console.log("✅ Converted to EventData:", events);
  return events;
}

function resolveStaffNames(
  staffIds: string[],
  staffLookup: Map<string, NYCPSStaff>,
): string[] {
  if (!staffIds.length) return ["Teacher TBD"];

  return staffIds.map((id, index) => {
    const staff = staffLookup.get(id);
    return staff?.staffName || `Teacher ${index + 1}`;
  });
}

function resolveStaffRole(
  staffId: string,
  staffLookup: Map<string, NYCPSStaff>,
): string {
  const staff = staffLookup.get(staffId);
  if (!staff?.rolesNYCPS?.length) return "Teacher";

  const roleMap: Record<string, string> = {
    Teacher: "Teacher",
    Coach: "School-based coach",
    AP: "School-based admin",
    Principal: "School-based admin",
    Administrator: "District/Network admin",
  };

  return roleMap[staff.rolesNYCPS[0]] || "Teacher";
}

function mapEventTypeToActivity(eventType: string): string {
  const activityMap: Record<string, string> = {
    [SessionPurposes.OBSERVATION]: "Observed instruction",
    [SessionPurposes.DEBRIEF]: "Held debrief",
    [SessionPurposes.CO_PLANNING]: "Planned for instruction",
    [SessionPurposes.PLC]: "Analyzed student work",
  };

  return activityMap[eventType] || "Observed instruction";
}

function calculateEventDuration(block: VisitScheduleBlock): string {
  // Use stored duration if valid
  if (block.duration && isValidFormDuration(block.duration.toString())) {
    return block.duration.toString();
  }

  // Calculate from times if available
  if (block.startTime && block.endTime) {
    const calculated = calculateDurationFromTimes(
      block.startTime,
      block.endTime,
    );
    if (calculated) return calculated;
  }

  // Default based on event type
  const eventDurations: Record<string, string> = {
    Observation: "45",
    Debrief: "30",
    "Co-Planning": "60",
    PLC: "60",
  };

  return eventDurations[block.eventType] || "45";
}

function isValidFormDuration(duration: string): boolean {
  return ["15", "30", "45", "60", "76", "90"].includes(duration);
}

function calculateDurationFromTimes(
  startTime: string,
  endTime: string,
): string | null {
  try {
    const start = new Date(`1970-01-01 ${startTime}`);
    const end = new Date(`1970-01-01 ${endTime}`);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    // Round to nearest valid duration
    const validDurations = [15, 30, 45, 60, 76, 90];
    const closest = validDurations.reduce((prev, curr) =>
      Math.abs(curr - diffMinutes) < Math.abs(prev - diffMinutes) ? curr : prev,
    );

    return closest.toString();
  } catch {
    console.warn("Could not calculate duration from times:", {
      startTime,
      endTime,
    });
    return null;
  }
}
