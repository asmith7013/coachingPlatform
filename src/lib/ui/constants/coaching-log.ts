// constants/indicators.ts
export const IMPLEMENTATION_INDICATORS = {
  "First year of Implementation": [
    "Doing the Math: Lesson Planning",
    "Understanding the Mathematical Progression: Unit Planning", 
    "Making the Math Accessible Part 1: Instructional Routines",
    "Synthesizing the Math: Synthesis"
  ],
  "Experienced with Implementation": [
    "Synthesizing the Math: Synthesis",
    "Making the Math Accessible Part 2: Scaffolding", 
    "Sustaining the Math: Sustain Teacher-Led Collaboration"
  ]
} as const;

// constants/strategies.ts
export const PRIMARY_STRATEGIES = {
  "Preparing to Teach": [
    "Reviewing student data",
    "Identifying or unpacking key student understandings",
    "Identifying essential learning activities", 
    "Identifying resources that provide access for all students",
    "Engage in doing the math together"
  ],
  "In-class support": [
    "Modeling full lesson",
    "Modeling partial lesson", 
    "Co-facilitation of lesson",
    "Observation of teacher-facilitated lesson"
  ],
  "Professional Learning": [
    "Professional Learning"
  ],
  "Sustaining Teacher-Led Collaboration": [
    "Identifying protocols for use in teacher team meetings",
    "Supporting teacher teams to refine and reflect on these protocols",
    "Provisioning support to one or more teachers in the facilitating of the protocols", 
    "Supporting the teacher team to reflect on the process",
    "Working with school administration to ensure school systems and structures support regular teacher teamwork"
  ]
} as const;

// Helper functions for form field population
export function getImplementationOptions(experience: string) {
  return IMPLEMENTATION_INDICATORS[experience as keyof typeof IMPLEMENTATION_INDICATORS] || [];
}

export function getPrimaryStrategyOptions(category: string) {
  return PRIMARY_STRATEGIES[category as keyof typeof PRIMARY_STRATEGIES] || [];
}

// Type helpers for TypeScript support
export type ImplementationExperienceKey = keyof typeof IMPLEMENTATION_INDICATORS;
export type PrimaryStrategyCategoryKey = keyof typeof PRIMARY_STRATEGIES;
export type ImplementationIndicatorValue = typeof IMPLEMENTATION_INDICATORS[ImplementationExperienceKey][number];
export type PrimaryStrategyValue = typeof PRIMARY_STRATEGIES[PrimaryStrategyCategoryKey][number]; 