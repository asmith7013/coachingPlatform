import type { TeacherSeedConfig } from "./teacher-seed-config.types";

export const MARCUS_WILLIAMS: TeacherSeedConfig = {
  email: "marcus.williams@schools.nyc.gov",
  displayName: "Marcus Williams",
  coachingDaysAgo: 30,

  // ── Action Plans ──────────────────────────────────────────────────────────
  actionPlans: {
    open: {
      title: "Classroom Management Foundations",
      status: "open",
      why: "Mr. Williams is a first-year teacher who needs to build foundational classroom management skills to create a structured, predictable learning environment.",
      skillUuids: [
        "f458fcbd-7736-4030-803c-e1426430c33f", // attention-grabber (L1)
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c", // specific-observable-directions (L1)
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58", // scan-positive-narration (L1)
        "209ee2c1-2395-46e4-92c8-333e4356677a", // keep-corrections-off-stage (L1)
        "84381975-e021-43ed-9a3e-3173350d9598", // use-proximity (L1)
      ],
      skillStatuses: {
        "f458fcbd-7736-4030-803c-e1426430c33f": "active",      // attention-grabber
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c": "active",      // specific-observable-directions
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58": "active",      // scan-positive-narration
        "209ee2c1-2395-46e4-92c8-333e4356677a": "developing",  // keep-corrections-off-stage
        "84381975-e021-43ed-9a3e-3173350d9598": "developing",  // use-proximity
      },
    },
    closed: {
      title: "Building Student Relationships",
      status: "closed",
      why: "Establishing strong student-teacher relationships to create a foundation of trust before introducing management structures.",
      skillUuids: [
        "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name (L1)
        "0eb74b47-131e-4ff6-9cd2-72b973eb72e3", // celebrate-using-specific-praise (L1)
        "15c96fa7-532f-4f4d-a718-537a3709c3c3", // assure-and-affirm (L1)
        "d384fc09-cb21-41c9-a23e-630fadfd9e3e", // emotional-regulation (L1)
        "89332ce9-ff4b-4f73-a1e4-5ae92dffd38e", // communicate-high-expectations (L1)
      ],
      skillStatuses: {
        "59d53eee-90e4-4031-9763-99129e34b678": "proficient",  // address-students-by-name
        "0eb74b47-131e-4ff6-9cd2-72b973eb72e3": "proficient",  // celebrate-using-specific-praise
        "15c96fa7-532f-4f4d-a718-537a3709c3c3": "proficient",  // assure-and-affirm
        "d384fc09-cb21-41c9-a23e-630fadfd9e3e": "developing",  // emotional-regulation
        "89332ce9-ff4b-4f73-a1e4-5ae92dffd38e": "developing",  // communicate-high-expectations
      },
    },
  },

  // ── Action Steps ──────────────────────────────────────────────────────────
  actionSteps: [
    // Open plan steps
    {
      planKey: "open",
      description: "Choose one consistent attention-grabber and practice it 5 times per class period until students respond within 3 seconds",
      dueDaysAgo: -5,
      evidenceOfCompletion: "90% of students respond to attention-grabber within 3 seconds",
      skillIndexes: [0], // attention-grabber
      completed: false,
    },
    {
      planKey: "open",
      description: "Script and rehearse specific, observable directions for the top 3 transitions and use scan-narrate to reinforce",
      dueDaysAgo: -12,
      evidenceOfCompletion: "Teacher uses scripted directions during transitions and narrates 3+ positive behaviors",
      skillIndexes: [1, 2], // specific-observable-directions, scan-positive-narration
      completed: false,
    },
    {
      planKey: "open",
      description: "Practice keeping corrections private — use proximity and quiet redirections instead of calling students out publicly",
      dueDaysAgo: -19,
      evidenceOfCompletion: "Zero public corrections in a single observed class period",
      skillIndexes: [3, 4], // keep-corrections-off-stage, use-proximity
      completed: false,
    },
    // Closed plan steps
    {
      planKey: "closed",
      description: "Learn every student's name and one personal detail within the first week — greet them at the door using their name",
      dueDaysAgo: 22,
      evidenceOfCompletion: "Teacher greets every student by name at the door for 5 consecutive days",
      skillIndexes: [0], // address-students-by-name
      completed: true,
      completedDaysAgo: 20,
    },
    {
      planKey: "closed",
      description: "Give at least 5 specific praise statements per period — name the exact behavior, not just 'good job'",
      dueDaysAgo: 15,
      evidenceOfCompletion: "Teacher consistently gives 5+ specific praise statements per period for a full week",
      skillIndexes: [1, 2], // celebrate-using-specific-praise, assure-and-affirm
      completed: true,
      completedDaysAgo: 13,
    },
    {
      planKey: "closed",
      description: "Practice emotional regulation strategies and frame expectations positively — 'I need you to...' instead of 'Stop doing...'",
      dueDaysAgo: 10,
      evidenceOfCompletion: "Teacher uses positive framing for 90% of redirections during an observed period",
      skillIndexes: [3, 4], // emotional-regulation, communicate-high-expectations
      completed: true,
      completedDaysAgo: 11,
    },
  ],

  // ── L1 Prerequisites ─────────────────────────────────────────────────────
  // No L2 skills in either plan
  l1Prereqs: [],

  // ── Extra Proficient Skills ───────────────────────────────────────────────
  extraProficientSkills: [
    "6814e051-70da-49bf-950d-10fe513a8fac", // rationale (L1)
    "4fb175ad-c2c0-4885-abc9-15ebebc39551", // positive-redirection (L1)
  ],

  // ── Observations ──────────────────────────────────────────────────────────
  observations: [
    {
      daysAgo: 20,
      type: "classroom_visit",
      notes: "Full period observation of Mr. Williams's 5th period. Strong rapport with students — they clearly like him and he knows their names. Transitions are slow (3-4 minutes between activities) and directions are often repeated multiple times. When off-task behavior happens, Mr. Williams tends to call students out across the room, which escalates the situation. He needs a private correction toolkit.",
      duration: 45,
      ratings: [
        {
          skillId: "attention-grabber",
          rating: "partial",
          evidence: "Uses 'eyes on me' but inconsistently — sometimes waits, sometimes talks over students.",
        },
        {
          skillId: "specific-observable-directions",
          rating: "partial",
          evidence: "Directions are vague ('get ready') rather than specific ('pencils down, eyes on me, hands folded').",
        },
        {
          skillId: "scan-positive-narration",
          rating: "not_observed",
          evidence: null,
        },
        {
          skillId: "keep-corrections-off-stage",
          rating: "partial",
          evidence: "Called out two students by name across the room for side conversations. Could use proximity instead.",
        },
      ],
      domainRatings: [
        {
          domainId: "culture",
          overallRating: "partial",
          evidence: "Strong relationships but management structures need development. Students like the teacher but routines are inconsistent.",
        },
      ],
    },
    {
      daysAgo: 14,
      type: "debrief",
      notes: "Debriefed the classroom observation. Mr. Williams was very receptive — he knows transitions are his biggest area for growth. We watched a video of a teacher using scan-and-narrate during a transition and he immediately saw how it could work. We scripted specific directions for his three main transitions and practiced delivering them with a confident, warm tone. He's committed to trying them starting Monday.",
      duration: 30,
      ratings: [],
      domainRatings: [],
    },
    {
      daysAgo: 3,
      type: "one_on_one",
      notes: "Weekly check-in. Mr. Williams tried the scripted directions this week and says transitions improved but aren't consistent yet. He forgot to scan-and-narrate a few times but when he did, students responded positively. We discussed keeping corrections off-stage — he's going to start using proximity (walking toward off-task students) instead of verbal callouts. Big win: he used specific praise 8 times in one period yesterday.",
      duration: 20,
      ratings: [
        {
          skillId: "address-students-by-name",
          rating: "fully",
          evidence: "Greets every student by name at the door. Knows personal details and references them in conversation.",
        },
        {
          skillId: "celebrate-using-specific-praise",
          rating: "mostly",
          evidence: "Giving specific praise frequently — 'I love how you showed your work step by step, Jaylen' — but sometimes reverts to generic 'good job'.",
        },
      ],
      domainRatings: [],
    },
  ],

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: [
    {
      content: "Mr. Williams's biggest strength is his relationships with students. They trust him and want to do well for him. The management structures we're building will amplify this natural rapport. Key insight: he responds best to seeing models on video before trying techniques himself.",
      skillIds: [
        "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name
        "0eb74b47-131e-4ff6-9cd2-72b973eb72e3", // celebrate-using-specific-praise
      ],
      planKeys: ["closed"],
    },
    {
      content: "Transitions are the main area to tighten. Mr. Williams loses 12-15 minutes per period to slow transitions. Scripting directions and using scan-narrate should cut this significantly. We need to get this in place before adding more instructional complexity.",
      skillIds: [
        "f458fcbd-7736-4030-803c-e1426430c33f", // attention-grabber
        "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c", // specific-observable-directions
        "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58", // scan-positive-narration
      ],
      planKeys: ["open"],
    },
    {
      content: "Planning note: Next observation should be a short drop-in (15 min) focused specifically on transitions. Look for whether Mr. Williams uses the scripted directions, scans and narrates, and avoids public corrections. This is the critical lever right now.",
      skillIds: [
        "209ee2c1-2395-46e4-92c8-333e4356677a", // keep-corrections-off-stage
        "84381975-e021-43ed-9a3e-3173350d9598", // use-proximity
      ],
      planKeys: ["open"],
    },
  ],
};
