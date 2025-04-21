import mongoose from 'mongoose';

/**
 * Creates a valid rubric array with all required fields for LookFor seeding
 * 
 * @param theme The theme for the rubric (e.g., 'Engagement', 'Discourse')
 * @returns An array of valid rubric objects
 */
export function createExampleRubric(theme: string) {
  // Create rubric with all required fields
  return [
    {
      _id: new mongoose.Types.ObjectId(),
      score: 1,
      label: `Ineffective ${theme}`,
      description: `Limited or ineffective ${theme.toLowerCase()}`,
      category: ['Basic', 'Needs Improvement'],
      content: [`Most students do not demonstrate effective ${theme.toLowerCase()}`],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      score: 2,
      label: `Developing ${theme}`,
      description: `Inconsistent ${theme.toLowerCase()}`,
      category: ['Developing', 'Progressing'],
      content: [`Some students demonstrate effective ${theme.toLowerCase()}`],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      score: 3,
      label: `Effective ${theme}`,
      description: `Consistent ${theme.toLowerCase()}`,
      category: ['Proficient', 'Strong'],
      content: [`Most students demonstrate effective ${theme.toLowerCase()}`],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      score: 4,
      label: `Highly Effective ${theme}`,
      description: `Exceptional ${theme.toLowerCase()}`,
      category: ['Advanced', 'Exemplary'],
      content: [`All students demonstrate highly effective ${theme.toLowerCase()}`],
    }
  ];
}

/**
 * Pre-defined rubrics for common use cases
 */
export const exampleRubrics = {
  studentEngagement: createExampleRubric('Student Engagement'),
  mathematicalDiscourse: createExampleRubric('Mathematical Discourse'),
  differentiation: createExampleRubric('Differentiation'),
  questioningTechniques: createExampleRubric('Questioning Techniques'),
  feedback: createExampleRubric('Feedback'),
  studentVoice: createExampleRubric('Student Voice')
}; 