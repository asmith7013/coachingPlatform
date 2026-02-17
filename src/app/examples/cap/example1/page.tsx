import React from "react";
import { ActionPlan } from "../components/ActionPlan";

export default function StandardCAPExamplePage() {
  const exampleData = {
    title: "Reading Comprehension Coaching Action Plan",
    coach: "Sarah Johnson",
    teacher: "Michael Rodriguez",
    subject: "5th Grade ELA",
    startDate: "September 15, 2023",
    endDate: "December 15, 2023",
    objective:
      "Improve students' reading comprehension skills, particularly in making inferences and identifying main ideas, through the implementation of close reading strategies and guided reading groups.",
    stageInfo: {
      number: 2,
      title: "Implementation",
      content: (
        <div>
          <p className="mb-3">
            During this stage, we are focused on implementing the agreed-upon
            strategies and collecting evidence of their impact on student
            learning. Regular check-ins and adjustments are being made based on
            student response.
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3">
            <p className="text-sm font-medium text-yellow-800">
              Current Focus: Small group guided reading with differentiated
              texts and questioning strategies.
            </p>
          </div>
        </div>
      ),
    },
    successMetrics: {
      metrics: [
        {
          name: "% of students correctly identifying main ideas in grade-level text",
          scores: [45, 52, 68, null],
        },
        {
          name: "% of students making accurate inferences based on textual evidence",
          scores: [38, 42, 55, null],
        },
        {
          name: "% of students scoring proficient or above on bi-weekly comprehension assessments",
          scores: [40, 48, 63, null],
        },
      ],
      dates: ["Sept 15", "Oct 15", "Nov 15", "Dec 15"],
    },
    coachingMoves: [
      {
        category: "Observation & Feedback",
        moves: [
          "Conduct bi-weekly observations focused on reading instruction",
          "Provide specific feedback on questioning techniques",
          "Model effective reading comprehension strategies",
        ],
        tools: [
          "Observation protocol",
          "Feedback template",
          "Video recording for reflection",
        ],
      },
      {
        category: "Co-planning",
        moves: [
          "Weekly co-planning sessions for guided reading groups",
          "Develop differentiated questioning stems",
          "Create text-dependent questions for close reading",
        ],
        tools: [
          "Lesson planning template",
          "Question stem bank",
          "Text complexity rubric",
        ],
      },
      {
        category: "Data Analysis",
        moves: [
          "Review student work samples together",
          "Analyze patterns in comprehension assessments",
          "Adjust instruction based on data findings",
        ],
        tools: [
          "Student work protocol",
          "Data tracking spreadsheet",
          "Instructional decision tree",
        ],
      },
    ],
    implementation: {
      records: [
        {
          date: "Sept 20, 2023",
          moveSelected: "Observation & specific feedback on questioning",
          teacherActions:
            "Implemented wait time after questions; began using higher-order questioning",
          studentOutcomes:
            "Increased student participation; deeper responses from some students",
          nextStep: "Focus on involving reluctant participants",
        },
        {
          date: "Oct 5, 2023",
          moveSelected: "Co-planning for guided reading groups",
          teacherActions:
            "Reorganized groups based on specific skill needs; introduced leveled texts",
          studentOutcomes:
            "Better engagement in small groups; struggling readers showing more confidence",
          nextStep:
            "Develop strategy cards for student reference during reading",
        },
        {
          date: "Oct 25, 2023",
          moveSelected: "Student work analysis",
          teacherActions:
            "Adjusted questioning to target specific inference skills; modeled thinking aloud",
          studentOutcomes:
            "Improvement in written responses citing text evidence",
          nextStep: "Create visual anchor charts for inference strategies",
        },
        {
          date: "Nov 12, 2023",
          moveSelected: "Model close reading strategies",
          teacherActions:
            "Implemented annotation techniques; taught text structure analysis",
          studentOutcomes:
            "Students beginning to annotate independently; improved comprehension of complex texts",
          nextStep: "Develop peer discussion protocols to deepen understanding",
        },
      ],
      dates: ["Sept 20", "Oct 5", "Oct 25", "Nov 12", "Nov 30", "Dec 10"],
    },
    monitoring: {
      metrics: [
        {
          name: "% of students correctly identifying main ideas",
          scores: [45, 52, 68, null],
        },
        {
          name: "% of students making accurate inferences",
          scores: [38, 42, 55, null],
        },
        {
          name: "% of students scoring proficient or above",
          scores: [40, 48, 63, null],
        },
      ],
      dates: ["Sept 15", "Oct 15", "Nov 15", "Dec 15"],
      evidence: [
        "https://example.com/evidence1",
        "https://example.com/evidence2",
        "https://example.com/evidence3",
        "",
      ],
    },
    reflections: [
      {
        question:
          "What strategies have been most effective in improving student comprehension?",
        response:
          "The explicit teaching of annotation techniques and the restructuring of guided reading groups based on specific skill needs have shown the most impact. Students are now more actively engaged with texts and are developing stronger metacognitive awareness during reading.",
      },
      {
        question:
          "What adjustments would improve implementation in the next phase?",
        response:
          "We need to focus more on transferring these skills to independent reading contexts. Creating opportunities for students to apply close reading strategies during independent reading time with appropriate scaffolding will be key in the next phase.",
      },
      {
        question:
          "How has this coaching cycle impacted your teaching practice?",
        response:
          "I've become much more intentional about questioning techniques and more systematic in using formative assessment data to drive instruction. The regular feedback has helped me refine my guided reading approach and better differentiate for various reading levels.",
      },
    ],
  };

  return (
    <main className="py-8 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a
            href="/examples/cap"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to CAP Examples
          </a>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center">
          Standard Coaching Action Plan Example
        </h1>
        <ActionPlan {...exampleData} />
      </div>
    </main>
  );
}
