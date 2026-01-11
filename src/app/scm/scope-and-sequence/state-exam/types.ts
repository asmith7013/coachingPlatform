import type { StateTestQuestion } from "@/app/tools/state-test-scraper/lib/types";

export interface ScrapeStats {
  total: number;
  byGrade: Record<string, number>;
  byYear: Record<string, number>;
}

export interface DomainColors {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export interface StandardWithCount {
  standard: string;
  count: number;
  shortForm: string;
  domain: string;
}

export interface DomainGroup {
  domain: string;
  label: string;
  standards: StandardWithCount[];
  totalCount: number;
}

export interface UnitStandardsData {
  unitNumber: number;
  unitName: string;
  domainGroups: DomainGroup[];
}

export interface UnitDistributionRow {
  unitNumber: number;
  mc: number;
  cr: number;
  mcPct: number;
  crPct: number;
}

export interface UnmatchedQuestion {
  standard: string;
  questionType: string;
  count: number;
}

export interface UnitDistributionData {
  rows: UnitDistributionRow[];
  totalMC: number;
  totalCR: number;
  unmatchedQuestions: UnmatchedQuestion[];
}

export interface StandardDistributionData {
  domain: string;
  label: string;
  standards: Array<{ standard: string; mc: number; cr: number }>;
  totalMC: number;
  totalCR: number;
  total: number;
}

export interface StandardsDistribution {
  domains: StandardDistributionData[];
  grandTotalMC: number;
  grandTotalCR: number;
}

export interface QuestionsByStandardData {
  questions: StateTestQuestion[];
  isSecondaryMatch: Map<string, boolean>;
}

// Re-export for convenience
export type { StateTestQuestion };
