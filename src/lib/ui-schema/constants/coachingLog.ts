// constants/indicators.ts
export const IMPLEMENTATION_INDICATORS = [
    {
      id: "first_year",
      title: "First year of Implementation",
      options: [
        { id: "lesson_planning", name: "Doing the Math: Lesson Planning" },
        { id: "unit_planning", name: "Understanding the Mathematical Progression: Unit Planning" },
        { id: "instructional_routines", name: "Making the Math Accessible Part 1: Instructional Routines" },
        { id: "synthesis", name: "Synthesizing the Math: Synthesis" }
      ]
    },
    {
      id: "experienced",
      title: "Experienced with Implementation",
      options: [
        { id: "synthesis", name: "Synthesizing the Math: Synthesis" },
        { id: "scaffolding", name: "Making the Math Accessible Part 2: Scaffolding" },
        { id: "teacher_collab", name: "Sustaining the Math: Sustain Teacher-Led Collaboration" }
      ]
    }
  ];


  // constants/strategies.ts
export const PRIMARY_STRATEGIES = [
    {
      id: "preparing_to_teach",
      title: "Preparing to Teach",
      options: [
        { id: "review_data", name: "Reviewing student data" },
        { id: "unpacking_understandings", name: "Identifying or unpacking key student understandings" },
        { id: "learning_activities", name: "Identifying essential learning activities" },
        { id: "access_resources", name: "Identifying resources that provide access for all students" },
        { id: "doing_math", name: "Engage in doing the math together" }
      ]
    },
    {
      id: "in_class_support",
      title: "In-class support",
      options: [
        { id: "model_full", name: "Modeling full lesson" },
        { id: "model_partial", name: "Modeling partial lesson" },
        { id: "co_facilitation", name: "Co-facilitation of lesson" },
        { id: "teacher_observation", name: "Observation of teacher-facilitated lesson" }
      ]
    },
    {
      id: "professional_learning",
      title: "Professional Learning",
      options: [{ id: "pro_learning", name: "Professional Learning" }]
    },
    {
      id: "teacher_collaboration",
      title: "Sustaining Teacher-Led Collaboration",
      options: [
        { id: "protocols", name: "Identifying protocols for use in teacher team meetings" },
        { id: "refine_protocols", name: "Supporting teacher teams to refine and reflect on these protocols" },
        { id: "facilitation_support", name: "Provisioning support to one or more teachers in the facilitating of the protocols" },
        { id: "reflection", name: "Supporting the teacher team to reflect on the process" },
        { id: "admin_systems", name: "Working with school administration to ensure school systems and structures support regular teacher teamwork" }
      ]
    }
  ];