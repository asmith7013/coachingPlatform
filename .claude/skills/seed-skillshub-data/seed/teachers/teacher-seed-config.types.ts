export type SkillStatus = "active" | "developing" | "proficient";

export interface ActionPlanConfig {
  title: string;
  status: "open" | "closed" | "archived";
  why: string;
  skillUuids: string[];
  skillStatuses: Record<string, SkillStatus>;
}

export interface ActionStepConfig {
  /** Key in the actionPlans record (e.g., "open", "closed") */
  planKey: string;
  description: string;
  /** Positive = past, negative = future (passed to daysAgo helper) */
  dueDaysAgo: number;
  evidenceOfCompletion: string;
  /** Indexes into the plan's skillUuids array */
  skillIndexes: number[];
  completed: boolean;
  /** Only used when completed is true */
  completedDaysAgo?: number;
}

export interface ObservationRating {
  skillId: string;
  rating: "not_observed" | "partial" | "mostly" | "fully";
  evidence: string | null;
}

export interface ObservationDomainRating {
  domainId: string;
  overallRating: "not_observed" | "partial" | "mostly" | "fully";
  evidence: string | null;
}

export interface ObservationConfig {
  daysAgo: number;
  type: "classroom_visit" | "debrief" | "one_on_one" | "quick_update";
  notes: string;
  duration: number;
  ratings: ObservationRating[];
  domainRatings: ObservationDomainRating[];
}

export interface NoteConfig {
  content: string;
  skillIds: string[];
  /** Keys in the actionPlans record to link action plan IDs */
  planKeys: string[];
}

export interface TeacherSeedConfig {
  email: string;
  /** Display name used if staff record needs to be created */
  displayName: string;
  /** How many days ago the coaching assignment was created */
  coachingDaysAgo: number;

  /** Keyed by arbitrary string (e.g., "open", "closed", "archived") */
  actionPlans: Record<string, ActionPlanConfig>;

  actionSteps: ActionStepConfig[];

  /** L1 prereq UUIDs that must be proficient (for L2 skills in plans) */
  l1Prereqs: string[];

  /** Additional skills marked proficient independent of plans */
  extraProficientSkills: string[];

  observations: ObservationConfig[];
  notes: NoteConfig[];
}
