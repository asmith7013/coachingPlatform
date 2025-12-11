import type { UnitSectionInfo, StudentLessonInfo } from "../../../hooks/usePacingData";

// Column configuration for the progress bar
// Used for both zone columns and the complete column
export interface ColumnConfig {
  zone: string;
  width: string | number; // percentage or fixed px
  isFixedWidth: boolean;
  isLastColumn: boolean;
  sections: UnitSectionInfo[];
  headerLabel?: string;
  totalStudents: number;
  studentNames: string[];
  isCompleteColumn?: boolean;
  // For complete column - student details
  completedStudents?: StudentLessonInfo[];
}
