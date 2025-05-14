export interface MetricType {
  name: string;
  type: 'IPG' | 'L&R' | 'Project' | 'Other';
  ratings: { score: number; description: string }[];
}

export interface CoachingMoveType {
  category: string;
  specificMove: string;
  toolsResources: string;
}

export interface ImplementationRecordType {
  date: string;
  proposedArc: string[];
  movesSelected: string[];
  metrics: Record<string, number>;
  evidenceLink: string;
  teacherNotes: string;
  studentNotes: string;
  nextStep: string;
  nextStepDone: boolean;
  betweenSessionSupport: string;
} 