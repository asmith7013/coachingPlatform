import type { TeacherSeedConfig } from "./teacher-seed-config.types";

export const JANE_DOE: TeacherSeedConfig = {
  email: "jane.doe@schools.nyc.gov",
  displayName: "Jane Doe",
  coachingDaysAgo: 60,

  // ── Action Plans ──────────────────────────────────────────────────────────
  actionPlans: {
    open: {
      title: "Small Group Facilitation",
      status: "open",
      why: "The teacher needs to strengthen their ability to facilitate meaningful student-to-student interactions during small group instruction.",
      skillUuids: [
        "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58", // facilitate-student-to-student-relationships (L2)
        "1358ca7c-7e8b-452c-8a52-5f3041f65533", // lead-turn-and-talk (L2)
        "6b2df8f9-5566-43c3-b103-eee726fff768", // normalize-mistakes-as-learning-sgi (L2)
        "4eceaa9c-e1a5-45ee-a495-447a569fcea3", // promote-growth-mindset-sgi (L2)
        "cd2379da-ae43-4a34-adfe-54def0987046", // facilitate-student-independent-practice (L1)
      ],
      skillStatuses: {
        "1358ca7c-7e8b-452c-8a52-5f3041f65533": "active",     // lead-turn-and-talk
        "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58": "active",     // facilitate-student-to-student-relationships
        "cd2379da-ae43-4a34-adfe-54def0987046": "active",      // facilitate-student-independent-practice
        "6b2df8f9-5566-43c3-b103-eee726fff768": "developing",  // normalize-mistakes-as-learning-sgi
        "4eceaa9c-e1a5-45ee-a495-447a569fcea3": "developing",  // promote-growth-mindset-sgi
      },
    },
    closed: {
      title: "Lesson Launch Routines",
      status: "closed",
      why: "Establishing consistent lesson launch routines to maximize instructional time.",
      skillUuids: [
        "3a12be8f-d52f-496a-8457-04ad148e7054", // minute-drills (L1)
        "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b", // lead-whole-class-warm-up-nyse (L2)
        "b5654862-cac2-429c-82ca-f884e0ab53be", // attendance-lesson-completion-data-share (L1)
        "2def541a-d6b8-4d49-8915-5e4812b25e39", // work-time-goal (L1)
        "998bcf75-4cdb-4ca4-ac40-709963ab8c28", // gathering-materials-routine (L1)
      ],
      skillStatuses: {
        "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b": "developing",  // lead-whole-class-warm-up-nyse (L2)
        "b5654862-cac2-429c-82ca-f884e0ab53be": "developing",  // attendance-lesson-completion-data-share
        "2def541a-d6b8-4d49-8915-5e4812b25e39": "developing",  // work-time-goal
        "998bcf75-4cdb-4ca4-ac40-709963ab8c28": "developing",  // gathering-materials-routine
        "3a12be8f-d52f-496a-8457-04ad148e7054": "proficient",  // minute-drills (L1 pair of L2)
      },
    },
    archived: {
      title: "Classroom Culture Foundations",
      status: "archived",
      why: "Building a positive and inclusive classroom culture where students feel seen and celebrated.",
      skillUuids: [
        "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name (L1)
        "0eb74b47-131e-4ff6-9cd2-72b973eb72e3", // celebrate-using-specific-praise (L1)
        "9cf123a9-896f-46d4-ab36-473305d911ee", // celebrate-whole-class (L1)
        "15c96fa7-532f-4f4d-a718-537a3709c3c3", // assure-and-affirm (L1)
        "cdb2e644-243f-4e10-882d-018f140bfcfd", // build-personal-rapport (L2)
      ],
      skillStatuses: {
        "59d53eee-90e4-4031-9763-99129e34b678": "proficient", // address-students-by-name
        "0eb74b47-131e-4ff6-9cd2-72b973eb72e3": "proficient", // celebrate-using-specific-praise
        "9cf123a9-896f-46d4-ab36-473305d911ee": "proficient", // celebrate-whole-class
        "15c96fa7-532f-4f4d-a718-537a3709c3c3": "proficient", // assure-and-affirm
        "cdb2e644-243f-4e10-882d-018f140bfcfd": "proficient", // build-personal-rapport
      },
    },
  },

  // ── Action Steps ──────────────────────────────────────────────────────────
  actionSteps: [
    // Open plan steps
    {
      planKey: "open",
      description: "Implement structured turn-and-talk routine during small group instruction with sentence starters posted visibly",
      dueDaysAgo: -7,
      evidenceOfCompletion: "Students independently using sentence starters during partner discussions",
      skillIndexes: [1, 0], // lead-turn-and-talk, facilitate-student-to-student-relationships
      completed: true,
      completedDaysAgo: 2,
    },
    {
      planKey: "open",
      description: "Practice normalizing mistakes by modeling think-aloud when errors occur during worked examples",
      dueDaysAgo: -14,
      evidenceOfCompletion: "Teacher consistently responds to errors with curiosity rather than correction",
      skillIndexes: [2, 3], // normalize-mistakes-as-learning-sgi, promote-growth-mindset-sgi
      completed: false,
    },
    {
      planKey: "open",
      description: "Gradually release responsibility by having students lead their own practice after worked example",
      dueDaysAgo: -21,
      evidenceOfCompletion: "Students working independently for 10+ minutes with minimal prompts",
      skillIndexes: [4], // facilitate-student-independent-practice
      completed: false,
    },
    // Closed plan steps
    {
      planKey: "closed",
      description: "Set up and run 2-minute fluency drills at the start of each class period",
      dueDaysAgo: 20,
      evidenceOfCompletion: "Drills happening consistently with timer visible to students",
      skillIndexes: [0], // minute-drills
      completed: true,
      completedDaysAgo: 18,
    },
    {
      planKey: "closed",
      description: "Create and display daily warm-up routine with attendance data share",
      dueDaysAgo: 14,
      evidenceOfCompletion: "Routine posted and students complete warm-up within 5 minutes",
      skillIndexes: [1, 2], // lead-whole-class-warm-up-nyse, attendance-lesson-completion-data-share
      completed: true,
      completedDaysAgo: 12,
    },
    {
      planKey: "closed",
      description: "Implement materials routine with work-time goal posted daily",
      dueDaysAgo: 7,
      evidenceOfCompletion: "Students independently gathering materials within 2 minutes",
      skillIndexes: [3, 4], // work-time-goal, gathering-materials-routine
      completed: true,
      completedDaysAgo: 8,
    },
    // Archived plan steps
    {
      planKey: "archived",
      description: "Learn and use every student's preferred name within the first two weeks",
      dueDaysAgo: 50,
      evidenceOfCompletion: "Teacher greets each student by name at the door",
      skillIndexes: [0, 4], // address-students-by-name, build-personal-rapport
      completed: true,
      completedDaysAgo: 48,
    },
    {
      planKey: "archived",
      description: "Implement specific praise and class celebrations routine at end of each period",
      dueDaysAgo: 40,
      evidenceOfCompletion: "Teacher gives 3+ specific praise statements per period and closes with celebration",
      skillIndexes: [1, 2, 3], // celebrate-using-specific-praise, celebrate-whole-class, assure-and-affirm
      completed: true,
      completedDaysAgo: 42,
    },
  ],

  // ── L1 Prerequisites ─────────────────────────────────────────────────────
  l1Prereqs: [
    "2ceec917-f15c-4cf0-95fa-258a0a3b27cf", // articulate-stamp-big-idea (L1 pair of facilitate-student-to-student-relationships)
    "9f6a187b-9856-4314-a80a-ea88e676b84a", // ask-cfu-questions-worked-example (L1 pair of lead-turn-and-talk)
    "bebb23be-859f-434f-ad5c-ee7d9645a39a", // use-precise-math-vocabulary (L1 pair of normalize-mistakes-as-learning-sgi)
    "46bd46a0-8275-490d-bb1d-1891274e5ea2", // use-concise-language (L1 pair of promote-growth-mindset-sgi)
  ],

  // ── Extra Proficient Skills ───────────────────────────────────────────────
  extraProficientSkills: [
    "6f4a401c-c938-4a06-959c-10e3a23188fe", // complete-mastery-checks (L1)
    "a1a1af28-83ef-4587-a087-29b404bde3f2", // complete-assessments (L1)
    "bc6e44d9-1be2-42a0-bad4-2173058c9670", // complete-unit-unpack-protocol (L2, pair is complete-mastery-checks)
  ],

  // ── Observations ──────────────────────────────────────────────────────────
  observations: [
    {
      daysAgo: 21,
      type: "classroom_visit",
      notes: "Observed small group instruction during 4th period. Ms. Doe is beginning to implement turn-and-talk but needs to give students more wait time before calling on pairs. Good energy and rapport with students.",
      duration: 45,
      ratings: [
        {
          skillId: "facilitate-student-to-student-relationships",
          rating: "partial",
          evidence: "Students were placed in pairs but rarely spoke to each other without teacher prompting.",
        },
        {
          skillId: "lead-turn-and-talk",
          rating: "partial",
          evidence: "Turn-and-talk was attempted but sentence starters were not posted. Some students unsure of what to discuss.",
        },
        {
          skillId: "normalize-mistakes-as-learning-sgi",
          rating: "not_observed",
          evidence: null,
        },
        {
          skillId: "promote-growth-mindset-sgi",
          rating: "partial",
          evidence: "Teacher said \"good try\" but didn't specifically name what was good about the attempt.",
        },
      ],
      domainRatings: [],
    },
    {
      daysAgo: 14,
      type: "debrief",
      notes: "Debriefed the classroom visit from last week. Ms. Doe was reflective and identified the need for posted sentence starters. We practiced scripting growth mindset responses to common student errors. She committed to posting sentence starters by Monday.",
      duration: 30,
      ratings: [],
      domainRatings: [],
    },
    {
      daysAgo: 7,
      type: "one_on_one",
      notes: "Weekly check-in. Lesson launch routine is becoming more consistent. Students know the warm-up expectations. Discussed next steps for small group facilitation.",
      duration: 20,
      ratings: [
        {
          skillId: "minute-drills",
          rating: "mostly",
          evidence: "Drills are happening every day. Timer is visible. A few students still need reminders to begin.",
        },
        {
          skillId: "lead-whole-class-warm-up-nyse",
          rating: "mostly",
          evidence: "Warm-up is posted and students begin within 2 minutes of entering. Teacher circulates during warm-up.",
        },
      ],
      domainRatings: [
        {
          domainId: "lesson-launch",
          overallRating: "mostly",
          evidence: "Consistent routine established. Room for tightening transitions.",
        },
      ],
    },
    {
      daysAgo: 2,
      type: "quick_update",
      notes: "Quick hallway check-in. Ms. Doe shared that she posted the sentence starters and students are starting to use them. She wants to try the growth mindset scripting we practiced during her next small group session tomorrow.",
      duration: 5,
      ratings: [],
      domainRatings: [],
    },
  ],

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: [
    {
      content: "Ms. Doe showed strong improvement in her turn-and-talk routine this week. Students were more engaged when sentence starters were posted on the board. Next step: have students generate their own discussion stems.",
      skillIds: [
        "1358ca7c-7e8b-452c-8a52-5f3041f65533", // lead-turn-and-talk
        "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58", // facilitate-student-to-student-relationships
      ],
      planKeys: ["open"],
    },
    {
      content: "Noticed during walkthrough that minute drills are now fully routinized. Students start immediately when the timer appears on the board. Great progress from where we started.",
      skillIds: [
        "3a12be8f-d52f-496a-8457-04ad148e7054", // minute-drills
      ],
      planKeys: ["closed"],
    },
    {
      content: "Growth mindset language is an area to develop. When a student made an error during the worked example, Ms. Doe quickly corrected rather than exploring the thinking. We discussed reframing to: \"Tell me more about how you got that answer.\"",
      skillIds: [
        "6b2df8f9-5566-43c3-b103-eee726fff768", // normalize-mistakes-as-learning-sgi
        "4eceaa9c-e1a5-45ee-a495-447a569fcea3", // promote-growth-mindset-sgi
      ],
      planKeys: ["open"],
    },
    {
      content: "Ms. Doe has excellent personal rapport with students. She knows details about their lives outside school and references them in conversation. This is a real strength to build on as we work on small group facilitation.",
      skillIds: [
        "cdb2e644-243f-4e10-882d-018f140bfcfd", // build-personal-rapport
        "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name
      ],
      planKeys: [],
    },
    {
      content: "Planning note: For next observation, focus on whether students are able to work independently after the worked example. Look for evidence of gradual release — does the teacher step back and let students struggle productively?",
      skillIds: [
        "cd2379da-ae43-4a34-adfe-54def0987046", // facilitate-student-independent-practice
      ],
      planKeys: ["open"],
    },
  ],
};
