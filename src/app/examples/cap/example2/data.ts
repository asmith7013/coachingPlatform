export const exampleData = {
  // Header information
  coachName: "Alex Smith",
  district: "NY_D12",
  school: "Bronx Middle School 61",
  teacherName: "Maria Johnson",
  cycleNumber: 2,

  // Stage 1: Identify Needs & Determine Focus
  focus: "Core Action 2.B",
  rationale:
    "Based on the initial walkthrough, students have limited opportunities to engage with rigorous tasks that require mathematical reasoning. Most observed tasks were procedural with single correct answers rather than tasks requiring deeper thinking or multiple approaches.",

  // Stage 2: Set Goals
  goalSet:
    "By the end of the coaching cycle, the teacher will consistently implement tasks that require students to engage in productive struggle with grade-level mathematics concepts. As a result, students will demonstrate increased perseverance and articulate their mathematical reasoning. This will be evidenced by student work samples, classroom discourse observations, and exit ticket responses.",
  teacherOutcome:
    "Teacher will select and implement tasks requiring multiple approaches and student reasoning in at least 80% of observed lessons, up from current 30%.",
  studentOutcome:
    "Student engagement in mathematical discourse will increase from an average of 40% participation to 75% participation as measured by classroom observation data.",

  // Stage 3: Planning Implementation and Support
  actionSteps:
    "The coach will support the teacher in selecting and implementing rigorous mathematical tasks, facilitate reflection on student responses, and provide resources for scaffolding productive struggle.",

  // Session Planning
  sessions: [
    {
      number: 1,
      checkmarks: "☑️",
      weeklyFocus: "Identifying and selecting high-quality mathematical tasks",
      weeklyLookFors:
        "Tasks that allow multiple solution paths and require explanation of mathematical reasoning",
      coachAction:
        "Co-plan lesson with focus on task selection and anticipating student responses",
      teacherAction:
        "Select two high-quality tasks and prepare implementation plan with anticipated misconceptions",
      progressMonitoring:
        "Completed task analysis template with rubric for mathematical reasoning",
    },
    {
      number: 2,
      checkmarks: "☑️☑️",
      weeklyFocus: "Implementing tasks to support productive struggle",
      weeklyLookFors:
        "Teacher moves that maintain cognitive demand during implementation",
      coachAction:
        "Observe lesson and collect data on teacher questioning and student engagement",
      teacherAction:
        "Implement selected task with focus on questioning strategies that maintain rigor",
      progressMonitoring:
        "Video recording of lesson segment showing student discourse",
    },
    {
      number: 3,
      checkmarks: "☑️☑️☑️",
      weeklyFocus: "Analyzing student work and responses",
      weeklyLookFors:
        "Evidence of student reasoning and multiple approaches in written work",
      coachAction:
        "Facilitate analysis of student work samples using a protocol",
      teacherAction:
        "Categorize student responses and identify next instructional steps",
      progressMonitoring:
        "Student work samples with assessment of reasoning quality",
    },
    {
      number: 4,
      checkmarks: "☑️☑️☑️☑️",
      weeklyFocus: "Refining implementation based on student outcomes",
      weeklyLookFors:
        "Adjustments to task implementation based on previous student performance",
      coachAction:
        "Co-plan modifications to upcoming unit tasks based on student data",
      teacherAction:
        "Implement refined approach to task selection and facilitation",
      progressMonitoring:
        "Comparison data showing increase in student reasoning quality",
    },
  ],

  // Implementation Records
  implementationRecords: [
    {
      number: 1,
      checkmarks: "☑️",
      lookFor:
        "Tasks that allow multiple solution paths and require explanation of mathematical reasoning",
      glows:
        "Teacher selected a rich task about proportional relationships that allowed for multiple entry points",
      areasToStrengthen:
        "Task implementation reduced cognitive demand when struggling students were given too much structure",
      metricsOfSuccess:
        "40% of students attempted multiple approaches; 25% provided clear written reasoning",
      nextSteps:
        "Practice questioning strategies that support struggle without reducing cognitive demand",
    },
    {
      number: 2,
      checkmarks: "☑️☑️",
      lookFor:
        "Teacher moves that maintain cognitive demand during implementation",
      glows:
        "Teacher used &quot;What are you noticing?&quot; and wait time effectively to encourage student thinking",
      areasToStrengthen:
        "Some student groups still looking to teacher for solution validation rather than reasoning",
      metricsOfSuccess:
        "60% of students engaged in mathematical discourse; Average explanation rating increased to 2.3/4",
      nextSteps:
        "Implement peer feedback protocol to reduce teacher as solution authority",
    },
    {
      number: 3,
      checkmarks: "☑️☑️☑️",
      lookFor:
        "Evidence of student reasoning and multiple approaches in written work",
      glows:
        "Student work samples showed significant improvement in justification quality",
      areasToStrengthen:
        "English learners need additional support structures for articulating reasoning",
      metricsOfSuccess:
        "70% of students used multiple representations; Reasoning quality averaged 2.8/4",
      nextSteps:
        "Develop sentence frames and visual supports for mathematical explanations",
    },
    {
      number: 4,
      checkmarks: "☑️☑️☑️☑️",
      lookFor:
        "Adjustments to task implementation based on previous student performance",
      glows:
        "Teacher effectively modified questioning based on student needs without reducing rigor",
      areasToStrengthen:
        "Continue developing strategies for helping students connect multiple representations",
      metricsOfSuccess:
        "85% student engagement; 75% provided clear mathematical reasoning",
      nextSteps: "Share successful strategies with grade level team",
    },
  ],

  // Stage 4: Analyze and Discuss
  goalMet: "yes",
  evidence:
    "Video recording of final observed lesson showing 75% student participation in mathematical discourse; Student work samples showing multiple approaches and clear reasoning in 78% of student work",
  cycleImpact:
    "Student performance on unit assessment showed 22% improvement in questions requiring written explanation compared to previous unit. Teacher reports increased student perseverance with challenging problems.",
  finalTeacherOutcome:
    "Teacher implementation of high-cognitive demand tasks increased from 30% to 85% of observed lessons. Teacher questioning strategies maintained rigor in 80% of student interactions.",
  finalStudentOutcome:
    "Student participation in mathematical discourse increased from 40% to 75%. Quality of mathematical reasoning in written work improved from average score of 1.7/4 to 3.2/4 on department rubric.",
};
