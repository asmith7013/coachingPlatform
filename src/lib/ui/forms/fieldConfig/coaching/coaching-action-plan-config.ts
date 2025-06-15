import type { Field } from '@ui-types/form';
import type { CoachingActionPlan } from '@zod-schema/cap';

export const CoachingActionPlanFieldConfig: Field<CoachingActionPlan>[] = [
  {
    name: "ipgCoreAction",
    label: "IPG Core Action", 
    type: "select"
  },
  {
    name: "ipgSubCategory",
    label: "IPG Sub Category",
    type: "select"
  },
  {
    name: "rationale",
    label: "Rationale",
    type: "textarea"
  },
  {
    name: "pdfAttachment", 
    label: "PDF Attachment",
    type: "text"
  }
];

export function getIPGSubCategoryOptions(coreAction?: string) {
  const optionsMap = {
    CA1: [
      { value: "CA1A", label: "CA1A - Planning and Preparation", description: "Demonstrates knowledge of content and pedagogy" },
      { value: "CA1B", label: "CA1B - Planning and Preparation", description: "Demonstrates knowledge of students" },
      { value: "CA1C", label: "CA1C - Planning and Preparation", description: "Sets instructional outcomes" }
    ],
    CA2: [
      { value: "CA2A", label: "CA2A - Classroom Environment", description: "Creates environment of respect and rapport" },
      { value: "CA2B", label: "CA2B - Classroom Environment", description: "Establishes culture for learning" }
    ],
    CA3: [
      { value: "CA3A", label: "CA3A - Instruction", description: "Communicates with students" },
      { value: "CA3B", label: "CA3B - Instruction", description: "Uses questioning and discussion techniques" },
      { value: "CA3C", label: "CA3C - Instruction", description: "Engages students in learning" },
      { value: "CA3D", label: "CA3D - Instruction", description: "Uses assessment in instruction" },
      { value: "CA3E", label: "CA3E - Instruction", description: "Demonstrates flexibility and responsiveness" }
    ]
  };

  if (!coreAction) return [];
  return optionsMap[coreAction as keyof typeof optionsMap] || [];
}

export function getMetricCollectionMethodLabel(method: string): string {
  const methods = {
    observation: "Classroom Observation",
    data: "Student Data Analysis", 
    interview: "Teacher Interview",
    survey: "Student Survey"
  };
  return methods[method as keyof typeof methods] || method;
} 