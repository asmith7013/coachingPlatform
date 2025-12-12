// Types for calendar page components

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

// Color palette for units
export const UNIT_COLORS = [
  { base: "#2563EB", light: "#DBEAFE", medium: "#3B82F6", dark: "#1E3A8A" }, // blue
  { base: "#059669", light: "#D1FAE5", medium: "#10B981", dark: "#064E3B" }, // green
  { base: "#D97706", light: "#FEF3C7", medium: "#F59E0B", dark: "#78350F" }, // amber
  { base: "#0D9488", light: "#CCFBF1", medium: "#14B8A6", dark: "#134E4A" }, // teal
  { base: "#7C3AED", light: "#EDE9FE", medium: "#8B5CF6", dark: "#4C1D95" }, // purple
  { base: "#DB2777", light: "#FCE7F3", medium: "#EC4899", dark: "#831843" }, // pink
  { base: "#0891B2", light: "#CFFAFE", medium: "#06B6D4", dark: "#164E63" }, // cyan
  { base: "#EA580C", light: "#FFEDD5", medium: "#F97316", dark: "#7C2D12" }, // orange
];

// Get shade for a section based on its index
export const getSectionShade = (sectionIndex: number): "light" | "medium" | "dark" => {
  const shadeIndex = sectionIndex % 3;
  return shadeIndex === 0 ? "light" : shadeIndex === 1 ? "medium" : "dark";
};

// Get display label for section badge
export const getSectionBadgeLabel = (sectionId: string): string => {
  if (sectionId === "Ramp Up") return "R";
  if (sectionId === "Unit Test") return "T";
  return sectionId;
};

// Selection mode for interactive date picking
export type SelectionMode = {
  type: "start" | "end";
  unitKey: string;
  sectionId: string;
} | null;
