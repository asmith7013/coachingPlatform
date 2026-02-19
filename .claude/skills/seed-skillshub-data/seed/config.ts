import mongoose from "mongoose";

export const TEACHER_EMAIL = "jane.doe@schools.nyc.gov";
export const COACH_EMAIL = "alex.smith@teachinglab.org";

export const ACTION_PLANS = {
  open: {
    title: "Small Group Facilitation",
    status: "open" as const,
    why: "The teacher needs to strengthen their ability to facilitate meaningful student-to-student interactions during small group instruction.",
    actionStep: "Focus on implementing turn-and-talk routines and promoting growth mindset language during small group sessions.",
    skillUuids: [
      "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58", // facilitate-student-to-student-relationships
      "1358ca7c-7e8b-452c-8a52-5f3041f65533", // lead-turn-and-talk
      "6b2df8f9-5566-43c3-b103-eee726fff768", // normalize-mistakes-as-learning-sgi
      "4eceaa9c-e1a5-45ee-a495-447a569fcea3", // promote-growth-mindset-sgi
      "cd2379da-ae43-4a34-adfe-54def0987046", // facilitate-student-independent-practice
    ],
    targetStatus: "active" as const,
  },
  closed: {
    title: "Lesson Launch Routines",
    status: "closed" as const,
    why: "Establishing consistent lesson launch routines to maximize instructional time.",
    actionStep: "Implement minute drills and warm-up routines at the start of every class period.",
    skillUuids: [
      "3a12be8f-d52f-496a-8457-04ad148e7054", // minute-drills
      "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b", // lead-whole-class-warm-up-nyse
      "b5654862-cac2-429c-82ca-f884e0ab53be", // attendance-lesson-completion-data-share
      "2def541a-d6b8-4d49-8915-5e4812b25e39", // work-time-goal
      "998bcf75-4cdb-4ca4-ac40-709963ab8c28", // gathering-materials-routine
    ],
    targetStatus: "developing" as const,
  },
  archived: {
    title: "Classroom Culture Foundations",
    status: "archived" as const,
    why: "Building a positive and inclusive classroom culture where students feel seen and celebrated.",
    actionStep: "Learn and use every student's name, implement daily celebrations, and practice affirming language.",
    skillUuids: [
      "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name
      "0eb74b47-131e-4ff6-9cd2-72b973eb72e3", // celebrate-using-specific-praise
      "9cf123a9-896f-46d4-ab36-473305d911ee", // celebrate-whole-class
      "15c96fa7-532f-4f4d-a718-537a3709c3c3", // assure-and-affirm
      "cdb2e644-243f-4e10-882d-018f140bfcfd", // build-personal-rapport
    ],
    targetStatus: "proficient" as const,
  },
} as const;

export const EXTRA_PROFICIENT_SKILLS = [
  "6f4a401c-c938-4a06-959c-10e3a23188fe", // complete-mastery-checks
  "a1a1af28-83ef-4587-a087-29b404bde3f2", // complete-assessments
  "bc6e44d9-1be2-42a0-bad4-2173058c9670", // complete-unit-unpack-protocol
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
