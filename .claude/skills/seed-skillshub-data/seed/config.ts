import mongoose from "mongoose";

export const TEACHER_EMAIL = "ccardona@schools.nyc.gov";
export const COACH_EMAIL = "alex.smith@teachinglab.org";

export const ACTION_PLANS = {
  open: {
    title: "Small Group Facilitation",
    status: "open" as const,
    why: "Ms. Cardona needs to strengthen her ability to facilitate meaningful student-to-student interactions during small group instruction.",
    actionStep: "Focus on implementing turn-and-talk routines and promoting growth mindset language during small group sessions.",
    skillIds: [
      "facilitate-student-to-student-relationships",
      "lead-turn-and-talk",
      "normalize-mistakes-as-learning-sgi",
      "promote-growth-mindset-sgi",
      "facilitate-student-independent-practice",
    ],
    targetStatus: "active" as const,
  },
  closed: {
    title: "Lesson Launch Routines",
    status: "closed" as const,
    why: "Establishing consistent lesson launch routines to maximize instructional time.",
    actionStep: "Implement minute drills and warm-up routines at the start of every class period.",
    skillIds: [
      "minute-drills",
      "lead-whole-class-warm-up-nyse",
      "attendance-lesson-completion-data-share",
      "work-time-goal",
      "gathering-materials-routine",
    ],
    targetStatus: "developing" as const,
  },
  archived: {
    title: "Classroom Culture Foundations",
    status: "archived" as const,
    why: "Building a positive and inclusive classroom culture where students feel seen and celebrated.",
    actionStep: "Learn and use every student's name, implement daily celebrations, and practice affirming language.",
    skillIds: [
      "address-students-by-name",
      "celebrate-using-specific-praise",
      "celebrate-whole-class",
      "assure-and-affirm",
      "build-personal-rapport",
    ],
    targetStatus: "proficient" as const,
  },
} as const;

export const EXTRA_PROFICIENT_SKILLS = [
  "complete-mastery-checks",
  "complete-assessments",
  "complete-unit-unpack-protocol",
];

export interface StaffIds {
  teacherId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  teacherName: string;
  coachName: string;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
  return d;
}
