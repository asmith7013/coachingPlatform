import type { TeacherSeedConfig } from "./teacher-seed-config.types";

export const MARIA_SANTOS: TeacherSeedConfig = {
  email: "maria.santos@schools.nyc.gov",
  displayName: "Maria Santos",
  coachingDaysAgo: 90,

  // ── Action Plans ──────────────────────────────────────────────────────────
  actionPlans: {
    open: {
      title: "Inquiry Group Facilitation",
      status: "open",
      why: "Ms. Santos is ready to move into inquiry-based instruction. She needs to build routines for student-led mathematical exploration in small groups.",
      skillUuids: [
        "822717cc-743b-4ee1-be8a-7f3e9583de65", // state-inquiry-norms-explicitly (L1)
        "c1028753-8449-460d-8f0b-7eb9715767b5", // facilitate-understanding-the-question-protocol (L1)
        "79c38af4-cf02-4be0-a781-595550965645", // use-facilitative-questioning (L1)
        "d01ae4ab-9110-4f40-81d1-ca35805ed652", // elevate-student-language-math-terminology (L1)
        "bffca010-4633-419e-a2be-5b22fe730b4f", // cold-call-group-members-to-explain (L1)
      ],
      skillStatuses: {
        "822717cc-743b-4ee1-be8a-7f3e9583de65": "active",      // state-inquiry-norms-explicitly
        "c1028753-8449-460d-8f0b-7eb9715767b5": "active",      // facilitate-understanding-the-question-protocol
        "79c38af4-cf02-4be0-a781-595550965645": "active",      // use-facilitative-questioning
        "d01ae4ab-9110-4f40-81d1-ca35805ed652": "developing",  // elevate-student-language-math-terminology
        "bffca010-4633-419e-a2be-5b22fe730b4f": "developing",  // cold-call-group-members-to-explain
      },
    },
    closed: {
      title: "Effective Directions & Routines",
      status: "closed",
      why: "Strengthening classroom directions to reduce transition time and increase student independence.",
      skillUuids: [
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c", // specific-observable-directions (L1)
        "d170f476-e469-4043-9437-52eb8926cce4", // concise-sequential-directions (L1)
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58", // scan-positive-narration (L1)
        "074fe6e4-139c-42a4-a29f-726a3ee51311", // introduce-step-by-step-routines (L1)
        "9b3ab6f8-b437-449c-8594-84f66faabcfe", // routine-procedure-practice (L1)
      ],
      skillStatuses: {
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c": "proficient",  // specific-observable-directions
        "d170f476-e469-4043-9437-52eb8926cce4": "proficient",  // concise-sequential-directions
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58": "developing",  // scan-positive-narration
        "074fe6e4-139c-42a4-a29f-726a3ee51311": "developing",  // introduce-step-by-step-routines
        "9b3ab6f8-b437-449c-8594-84f66faabcfe": "developing",  // routine-procedure-practice
      },
    },
    archived: {
      title: "Lesson Launch Foundations",
      status: "archived",
      why: "Establishing a smooth, predictable start to each class period so students can settle in and begin learning quickly.",
      skillUuids: [
        "6b9868f4-ff27-4674-ad64-c2b157d76f2e", // greeting-every-student-by-name (L1)
        "f8fb04c8-c795-4fb4-b00a-dbd63352f394", // individual-class-celebrations (L1)
        "72a2ef7f-f698-4628-bdad-d13b88278e0b", // one-on-one-data-conversations (L1)
        "2def541a-d6b8-4d49-8915-5e4812b25e39", // work-time-goal (L1)
        "998bcf75-4cdb-4ca4-ac40-709963ab8c28", // gathering-materials-routine (L1)
      ],
      skillStatuses: {
        "6b9868f4-ff27-4674-ad64-c2b157d76f2e": "proficient", // greeting-every-student-by-name
        "f8fb04c8-c795-4fb4-b00a-dbd63352f394": "proficient", // individual-class-celebrations
        "72a2ef7f-f698-4628-bdad-d13b88278e0b": "proficient", // one-on-one-data-conversations
        "2def541a-d6b8-4d49-8915-5e4812b25e39": "proficient", // work-time-goal
        "998bcf75-4cdb-4ca4-ac40-709963ab8c28": "proficient", // gathering-materials-routine
      },
    },
  },

  // ── Action Steps ──────────────────────────────────────────────────────────
  actionSteps: [
    // Open plan steps
    {
      planKey: "open",
      description: "Post and explicitly teach inquiry norms at the start of each inquiry block, including sentence starters for mathematical disagreement",
      dueDaysAgo: -7,
      evidenceOfCompletion: "Students can articulate norms without prompting before beginning inquiry tasks",
      skillIndexes: [0, 1], // state-inquiry-norms-explicitly, facilitate-understanding-the-question-protocol
      completed: true,
      completedDaysAgo: 3,
    },
    {
      planKey: "open",
      description: "Practice facilitative questioning during inquiry — ask questions that push thinking forward without giving away answers",
      dueDaysAgo: -14,
      evidenceOfCompletion: "Teacher uses 3+ facilitative questions per inquiry session instead of telling",
      skillIndexes: [2, 3], // use-facilitative-questioning, elevate-student-language-math-terminology
      completed: false,
    },
    {
      planKey: "open",
      description: "Cold-call group members to explain their group's reasoning to the whole class during share-out",
      dueDaysAgo: -21,
      evidenceOfCompletion: "At least 2 students per session can clearly explain their group's approach",
      skillIndexes: [4], // cold-call-group-members-to-explain
      completed: false,
    },
    // Closed plan steps
    {
      planKey: "closed",
      description: "Script specific, observable directions for the three most common transitions in each class period",
      dueDaysAgo: 30,
      evidenceOfCompletion: "Directions are posted and teacher uses them verbatim during transitions",
      skillIndexes: [0, 1], // specific-observable-directions, concise-sequential-directions
      completed: true,
      completedDaysAgo: 28,
    },
    {
      planKey: "closed",
      description: "Implement scan-and-narrate during transitions — name students who are following directions",
      dueDaysAgo: 21,
      evidenceOfCompletion: "Teacher narrates 3+ positive behaviors during each transition",
      skillIndexes: [2], // scan-positive-narration
      completed: true,
      completedDaysAgo: 19,
    },
    {
      planKey: "closed",
      description: "Introduce step-by-step routines for materials distribution and practice them until automatic",
      dueDaysAgo: 14,
      evidenceOfCompletion: "Students complete materials routine in under 90 seconds without verbal prompts",
      skillIndexes: [3, 4], // introduce-step-by-step-routines, routine-procedure-practice
      completed: true,
      completedDaysAgo: 15,
    },
    // Archived plan steps
    {
      planKey: "archived",
      description: "Greet every student by name at the door and learn preferred names within the first week",
      dueDaysAgo: 75,
      evidenceOfCompletion: "Teacher greets each student by preferred name every day at the door",
      skillIndexes: [0, 2], // greeting-every-student-by-name, one-on-one-data-conversations
      completed: true,
      completedDaysAgo: 72,
    },
    {
      planKey: "archived",
      description: "Implement individual celebrations and post work-time goals with materials routine visible to students",
      dueDaysAgo: 65,
      evidenceOfCompletion: "Students know their work-time goal and materials are ready within 2 minutes",
      skillIndexes: [1, 3, 4], // individual-class-celebrations, work-time-goal, gathering-materials-routine
      completed: true,
      completedDaysAgo: 63,
    },
  ],

  // ── L1 Prerequisites ─────────────────────────────────────────────────────
  // No L2 skills in plans with external L1 pairs — all inquiry and culture skills used are L1
  l1Prereqs: [],

  // ── Extra Proficient Skills ───────────────────────────────────────────────
  extraProficientSkills: [
    "6e2466db-ae7c-4147-a9fc-4fe5f8c39772", // prepare-inquiry-materials (L1)
    "e13d49c7-3ec9-4d0a-9319-25d5989e7095", // select-students-for-inquiry-groups (L1)
  ],

  // ── Observations ──────────────────────────────────────────────────────────
  observations: [
    {
      daysAgo: 18,
      type: "classroom_visit",
      notes: "Observed Ms. Santos's 3rd period during an inquiry block. Students were grouped and had task cards, but several groups were stuck on understanding the question. Ms. Santos circulated well but tended to answer questions directly rather than asking facilitative questions. Strong classroom energy — students clearly like working in groups.",
      duration: 40,
      ratings: [
        {
          skillId: "state-inquiry-norms-explicitly",
          rating: "mostly",
          evidence: "Norms were posted on the board and referenced at the start, but not all students could articulate them when asked.",
        },
        {
          skillId: "facilitate-understanding-the-question-protocol",
          rating: "partial",
          evidence: "Teacher read the question aloud but did not check for understanding before releasing groups to work.",
        },
        {
          skillId: "use-facilitative-questioning",
          rating: "partial",
          evidence: "When groups were stuck, teacher gave hints rather than asking questions to guide thinking.",
        },
        {
          skillId: "cold-call-group-members-to-explain",
          rating: "not_observed",
          evidence: null,
        },
      ],
      domainRatings: [],
    },
    {
      daysAgo: 10,
      type: "one_on_one",
      notes: "Weekly check-in. Discussed the inquiry observation. Ms. Santos recognizes she defaults to telling when groups struggle. We role-played facilitative questioning with three common stuck points from last week's task. She's going to try the 'What do you notice? What do you wonder?' protocol this week.",
      duration: 25,
      ratings: [],
      domainRatings: [
        {
          domainId: "inquiry-groups",
          overallRating: "partial",
          evidence: "Inquiry routines are developing. Strong group energy but facilitation technique needs refinement.",
        },
      ],
    },
    {
      daysAgo: 3,
      type: "quick_update",
      notes: "Quick check-in after school. Ms. Santos tried the 'notice and wonder' protocol and said it worked much better — students were more engaged and she didn't have to give away answers. Wants to try elevating student math language next by having a vocabulary word wall for inquiry.",
      duration: 5,
      ratings: [],
      domainRatings: [],
    },
  ],

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: [
    {
      content: "Ms. Santos has strong group dynamics — students enjoy working together and she's built a classroom culture where collaboration feels natural. The next step is moving from cooperative work to true mathematical inquiry where students are driving the investigation.",
      skillIds: [
        "822717cc-743b-4ee1-be8a-7f3e9583de65", // state-inquiry-norms-explicitly
        "c1028753-8449-460d-8f0b-7eb9715767b5", // facilitate-understanding-the-question-protocol
      ],
      planKeys: ["open"],
    },
    {
      content: "Directions routines are now automatic — transitions happen in under 90 seconds with minimal verbal cues. This was a major improvement from where we started. Ms. Santos credits the scan-and-narrate technique for getting buy-in from reluctant students.",
      skillIds: [
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c", // specific-observable-directions
        "d170f476-e469-4043-9437-52eb8926cce4", // concise-sequential-directions
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58", // scan-positive-narration
      ],
      planKeys: ["closed"],
    },
    {
      content: "Key coaching move: When Ms. Santos defaults to telling, I'm going to pause and say 'What question could you ask instead?' This metacognitive prompt helped her catch herself during our role-play and she started self-correcting.",
      skillIds: [
        "79c38af4-cf02-4be0-a781-595550965645", // use-facilitative-questioning
      ],
      planKeys: ["open"],
    },
    {
      content: "Planning note: Next observation should focus on the share-out portion of inquiry. Look for whether Ms. Santos cold-calls group members and whether students use precise math vocabulary when explaining their reasoning.",
      skillIds: [
        "bffca010-4633-419e-a2be-5b22fe730b4f", // cold-call-group-members-to-explain
        "d01ae4ab-9110-4f40-81d1-ca35805ed652", // elevate-student-language-math-terminology
      ],
      planKeys: ["open"],
    },
  ],
};
