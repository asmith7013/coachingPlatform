export interface PDFExtractorState {
  selectedFile: File | null;
  grade: string;
  unit: number;
  titles: string;
  pageCount: number;
  isProcessing: boolean;
  extractedImages: Blob[];
  error: string;
  success: string;
}

export type GradeOption = "6th-grade" | "7th-grade" | "8th-grade" | "Algebra-1";

export const GRADE_OPTIONS: GradeOption[] = [
  "6th-grade",
  "7th-grade",
  "8th-grade",
  "Algebra-1",
];

export interface ProcessingResult {
  success: boolean;
  message: string;
  images?: Blob[];
}
