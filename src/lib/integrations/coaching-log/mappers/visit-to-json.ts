import type { Visit } from '@zod-schema/visits/visit';
import type { FormFieldEntry } from '../types';

interface CoachingLogDefaults {
  reasonDone: "Yes" | "No";
  totalDuration: "Full day - 6 hours" | "Half day - 3 hours";
  solvesTouchpoint: "Teacher support" | "Leader support" | "Teacher OR teacher & leader support";
  primaryStrategy: string;
  solvesSpecificStrategy: string;
  implementationIndicator: string;
  supportCycle: string;
  modeDone?: string;
  isContractor?: string;
  NYCDone?: string;
}

// District mapping - simplified approach since we don't have DISTRICTS constant
const DISTRICT_MAPPINGS: Record<string, string> = {
  // Add your district mappings here
  "Default School": "Default District",
  // Will fallback to "Unknown District" if not found
};

// @deprecated("Use zod schema directly instead")
export function visitToCoachingLogJson(
  visit: Visit,
  defaults: CoachingLogDefaults
): FormFieldEntry[] {
  
  // Find district info - simplified approach
  const schoolName = visit.schoolId || "";
  const districtName = DISTRICT_MAPPINGS[schoolName] || "Unknown District";

  // Build events from visit - simplified for current Visit schema
  const events = [{
    name: [visit.coachId || "Coach"],
    role: "Coach",
    activity: visit.allowedPurpose || "Observation",
    duration: "45"
  }];

  return [
    // Section 0: General Information
    {
      selector: "reasonDone",
      label: "Reason Done",
      value: defaults.reasonDone,
      organization: { section: 0, index: 0 }
    },
    {
      selector: "districtName",
      label: "District Name", 
      value: districtName,
      organization: { section: 0, index: 1 }
    },
    {
      selector: "schoolName",
      label: "School Name",
      value: schoolName,
      organization: { section: 0, index: 2 }
    },
    {
      selector: "totalDuration",
      label: "Total Duration",
      value: defaults.totalDuration,
      organization: { section: 0, index: 3 }
    },
    {
      selector: "Solvestouchpoint", // Note: matches your original selector
      label: "SOLVES Touchpoint",
      value: defaults.solvesTouchpoint,
      organization: { section: 0, index: 4 }
    },
    {
      selector: "PrimaryStrategy",
      label: "Primary Strategy", 
      value: defaults.primaryStrategy,
      organization: { section: 0, index: 5 }
    },
    {
      selector: "solvesSpecificStrategy",
      label: "SOLVES Specific Strategy",
      value: defaults.solvesSpecificStrategy,
      organization: { section: 0, index: 6 }
    },
    {
      selector: "implementationIndicator",
      label: "Implementation Indicator",
      value: defaults.implementationIndicator,
      organization: { section: 0, index: 7 }
    },
    {
      selector: "supportCycle",
      label: "Support Cycle",
      value: defaults.supportCycle,
      organization: { section: 0, index: 8 }
    },
    {
      selector: "modeDone",
      label: "Mode Done",
      value: defaults.modeDone || visit.modeDone || "In-person",
      organization: { section: 0, index: 9 }
    },
    {
      selector: "coachingDate",
      label: "Coaching Date",
      value: visit.date || new Date().toISOString().split('T')[0],
      organization: { section: 0, index: 10 }
    },
    // Section 1: Additional Fields
    {
      selector: "coachName",
      label: "Coach Name",
      value: visit.coachId || "",
      organization: { section: 1, index: 0 }
    },
    {
      selector: "teachersSupportedNumber",
      label: "Teachers Supported Number",
      value: "1", // Default since events structure is different
      organization: { section: 1, index: 1 }
    },
    {
      selector: "NYCSolvesGradeLevels[]",
      label: "Grade Levels",
      value: ["Elementary"], // Default - can be customized
      organization: { section: 1, index: 2 }
    },
    {
      selector: "teachersSupportedType[]", 
      label: "Teacher Types Supported",
      value: ["None of the above"], // Default - can be customized
      organization: { section: 1, index: 3 }
    },
    // Section 6: Events
    {
      selector: "events",
      label: "Events",
      value: events,
      organization: { section: 6, index: 0 }
    }
  ];
}
