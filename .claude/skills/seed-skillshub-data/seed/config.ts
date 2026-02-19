import mongoose from "mongoose";

export const TEACHER_EMAIL = "jane.doe@schools.nyc.gov";
export const COACH_EMAIL = "alex.smith@teachinglab.org";

export type SkillStatus = "active" | "developing" | "proficient";

export const ACTION_PLANS = {
  open: {
    title: "Small Group Facilitation",
    status: "open" as const,
    why: "The teacher needs to strengthen their ability to facilitate meaningful student-to-student interactions during small group instruction.",
    skillUuids: [
      "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58", // facilitate-student-to-student-relationships (L2)
      "1358ca7c-7e8b-452c-8a52-5f3041f65533", // lead-turn-and-talk (L2)
      "6b2df8f9-5566-43c3-b103-eee726fff768", // normalize-mistakes-as-learning-sgi (L2)
      "4eceaa9c-e1a5-45ee-a495-447a569fcea3", // promote-growth-mindset-sgi (L2)
      "cd2379da-ae43-4a34-adfe-54def0987046", // facilitate-student-independent-practice (L1)
    ],
    skillStatuses: {
      "1358ca7c-7e8b-452c-8a52-5f3041f65533": "active" as SkillStatus,     // lead-turn-and-talk
      "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58": "active" as SkillStatus,     // facilitate-student-to-student-relationships
      "cd2379da-ae43-4a34-adfe-54def0987046": "active" as SkillStatus,     // facilitate-student-independent-practice
      "6b2df8f9-5566-43c3-b103-eee726fff768": "developing" as SkillStatus, // normalize-mistakes-as-learning-sgi
      "4eceaa9c-e1a5-45ee-a495-447a569fcea3": "developing" as SkillStatus, // promote-growth-mindset-sgi
    },
  },
  closed: {
    title: "Lesson Launch Routines",
    status: "closed" as const,
    why: "Establishing consistent lesson launch routines to maximize instructional time.",
    skillUuids: [
      "3a12be8f-d52f-496a-8457-04ad148e7054", // minute-drills (L1)
      "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b", // lead-whole-class-warm-up-nyse (L2)
      "b5654862-cac2-429c-82ca-f884e0ab53be", // attendance-lesson-completion-data-share (L1)
      "2def541a-d6b8-4d49-8915-5e4812b25e39", // work-time-goal (L1)
      "998bcf75-4cdb-4ca4-ac40-709963ab8c28", // gathering-materials-routine (L1)
    ],
    skillStatuses: {
      "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b": "developing" as SkillStatus, // lead-whole-class-warm-up-nyse (L2)
      "b5654862-cac2-429c-82ca-f884e0ab53be": "developing" as SkillStatus, // attendance-lesson-completion-data-share
      "2def541a-d6b8-4d49-8915-5e4812b25e39": "developing" as SkillStatus, // work-time-goal
      "998bcf75-4cdb-4ca4-ac40-709963ab8c28": "developing" as SkillStatus, // gathering-materials-routine
      // minute-drills is L1 pair of lead-whole-class-warm-up-nyse → must be proficient
      "3a12be8f-d52f-496a-8457-04ad148e7054": "proficient" as SkillStatus, // minute-drills
    },
  },
  archived: {
    title: "Classroom Culture Foundations",
    status: "archived" as const,
    why: "Building a positive and inclusive classroom culture where students feel seen and celebrated.",
    skillUuids: [
      "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name (L1)
      "0eb74b47-131e-4ff6-9cd2-72b973eb72e3", // celebrate-using-specific-praise (L1)
      "9cf123a9-896f-46d4-ab36-473305d911ee", // celebrate-whole-class (L1)
      "15c96fa7-532f-4f4d-a718-537a3709c3c3", // assure-and-affirm (L1)
      "cdb2e644-243f-4e10-882d-018f140bfcfd", // build-personal-rapport (L2)
    ],
    skillStatuses: {
      "59d53eee-90e4-4031-9763-99129e34b678": "proficient" as SkillStatus, // address-students-by-name
      "0eb74b47-131e-4ff6-9cd2-72b973eb72e3": "proficient" as SkillStatus, // celebrate-using-specific-praise
      "9cf123a9-896f-46d4-ab36-473305d911ee": "proficient" as SkillStatus, // celebrate-whole-class
      "15c96fa7-532f-4f4d-a718-537a3709c3c3": "proficient" as SkillStatus, // assure-and-affirm
      "cdb2e644-243f-4e10-882d-018f140bfcfd": "proficient" as SkillStatus, // build-personal-rapport
    },
  },
} as const;

// L1 prereqs for L2 skills in the open plan — must be proficient
export const L1_PREREQS = [
  "2ceec917-f15c-4cf0-95fa-258a0a3b27cf", // articulate-stamp-big-idea (L1 pair of facilitate-student-to-student-relationships)
  "9f6a187b-9856-4314-a80a-ea88e676b84a", // ask-cfu-questions-worked-example (L1 pair of lead-turn-and-talk)
  "bebb23be-859f-434f-ad5c-ee7d9645a39a", // use-precise-math-vocabulary (L1 pair of normalize-mistakes-as-learning-sgi)
  "46bd46a0-8275-490d-bb1d-1891274e5ea2", // use-concise-language (L1 pair of promote-growth-mindset-sgi)
];

export const EXTRA_PROFICIENT_SKILLS = [
  "6f4a401c-c938-4a06-959c-10e3a23188fe", // complete-mastery-checks (L1)
  "a1a1af28-83ef-4587-a087-29b404bde3f2", // complete-assessments (L1)
  "bc6e44d9-1be2-42a0-bad4-2173058c9670", // complete-unit-unpack-protocol (L2, pair is complete-mastery-checks)
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
