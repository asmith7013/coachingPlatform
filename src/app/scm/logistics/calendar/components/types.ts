// Types for calendar page components

// Re-export unit colors from shared location
export {
  UNIT_COLORS,
  getSectionShade,
  getSectionBadgeLabel,
  type UnitColor,
} from "@/hooks/scm";

export interface SectionSchedule {
  sectionId: string;
  name: string;
  startDate: string;
  endDate: string;
  lessonCount: number;
}

export interface UnitScheduleLocal {
  unitKey: string; // Composite key: "grade-unitNumber" for uniqueness
  grade: string;
  unitNumber: number;
  unitName: string;
  startDate: string;
  endDate: string;
  sections: SectionSchedule[];
}

export interface SectionConfigOption {
  id: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
  school: string;
}

export interface SectionDayOff {
  date: string;
  name: string;
  type: string;
  description?: string;
}

// Selection mode for interactive date picking
export type SelectionMode = {
  type: "start" | "end";
  unitKey: string;
  sectionId: string;
} | null;
