// Types for calendar page components

// Re-export unit colors from shared location
export {
  UNIT_COLORS,
  getSectionShade,
  getSectionBadgeLabel,
  type UnitColor,
} from "@/hooks/scm";

export interface LessonForSubsection {
  scopeAndSequenceId: string;
  unitLessonId: string;
  lessonName: string;
  lessonNumber: number;
  subsection?: number;
}

export interface SectionSchedule {
  sectionId: string;
  subsection?: number; // Part number (1, 2, 3) for split sections
  name: string;
  startDate: string;
  endDate: string;
  lessonCount: number;
  lessons?: LessonForSubsection[];
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
  subsection?: number; // Track which subsection's date is being selected
  pendingStartDate?: string; // Track start date set in same flow (for auto-switch to end)
} | null;

// Subsections modal state
export interface SubsectionsModalState {
  isOpen: boolean;
  unitKey: string;
  sectionId: string;
  sectionName: string;
  lessons: LessonForSubsection[];
  grade: string;
}
