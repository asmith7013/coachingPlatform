// Mock data for the curriculum dropdown
export const curriculumData = {
  "Grade 6": {
    units: {
      "Unit 1": {
        lessons: ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5"],
      },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"] },
      "Unit 3": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
    },
  },
  "Grade 7": {
    units: {
      "Unit 1": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2"] },
    },
  },
  "Grade 8": {
    units: {
      "Unit 1": { lessons: ["Lesson 1", "Lesson 2"] },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
    },
  },
  "Algebra 1": {
    units: {
      "Unit 1": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 3": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 4": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 5": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 6": { lessons: ["Lesson 1", "Lesson 2", "Lesson 3"] },
      "Unit 7": {
        lessons: ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5"],
      },
    },
  },
  "Algebra 2": {
    units: {
      "Unit 1": { lessons: ["Lesson 1", "Lesson 2"] },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2"] },
    },
  },
  Geometry: {
    units: {
      "Unit 1": { lessons: ["Lesson 1", "Lesson 2"] },
      "Unit 2": { lessons: ["Lesson 1", "Lesson 2"] },
    },
  },
};

// Mock lesson data for Algebra 1, Unit 7, Lesson 2
export const exampleLessonData = {
  course: "Algebra 1",
  unit: "Unit 7",
  lesson: "Lesson 2",
  title: "When and Why Do We Write Quadratic Equations?",
  learningGoals: [
    "Recognize the limitations of certain strategies used to solve a quadratic equation.",
    "Understand that the factored form of a quadratic expression can help us find the zeros of a quadratic function and solve a quadratic equation.",
    "Write quadratic equations and reason about their solutions in terms of a situation.",
  ],
  coolDownUrl: "/curriculum/algebra1/unit7/lesson2/cooldown.pdf",
  handoutUrl: "/curriculum/algebra1/unit7/lesson2/student-handout.pdf",
  lessonUrl:
    "https://curriculum.illustrativemathematics.org/HS/teachers/1/7/2/index.html",
};
