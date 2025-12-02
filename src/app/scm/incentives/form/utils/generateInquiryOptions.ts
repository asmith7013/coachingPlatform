/**
 * Generate inquiry activity dropdown options based on unit sections
 */

export interface InquiryOption {
  value: string;
  label: string;
}

export interface InquiryOptionGroup {
  label: string;
  options: InquiryOption[];
}

/**
 * Generate inquiry options for a unit based on its sections
 * @param sections - Array of section letters (e.g., ["A", "B", "C"])
 * @returns Grouped options for inquiry dropdown
 */
export function generateInquiryOptions(sections: string[]): InquiryOptionGroup[] {
  const groups: InquiryOptionGroup[] = [];

  // Generate section checkpoints (3 questions each)
  sections.forEach((section) => {
    groups.push({
      label: `Section ${section} Checkpoint`,
      options: [
        {
          value: `Section ${section} Checkpoint - Question 1`,
          label: "Question 1",
        },
        {
          value: `Section ${section} Checkpoint - Question 2`,
          label: "Question 2",
        },
        {
          value: `Section ${section} Checkpoint - Question 3`,
          label: "Question 3",
        },
      ],
    });
  });

  // Mid-Unit Assessment (6 questions)
  groups.push({
    label: "Mid-Unit Assessment",
    options: Array.from({ length: 6 }, (_, i) => ({
      value: `Mid-Unit Assessment - Question ${i + 1}`,
      label: `Question ${i + 1}`,
    })),
  });

  // End-of-Unit Assessment Version B (8 questions)
  groups.push({
    label: "End-of-Unit Assessment Version B",
    options: Array.from({ length: 8 }, (_, i) => ({
      value: `End-of-Unit Assessment Version B - Question ${i + 1}`,
      label: `Question ${i + 1}`,
    })),
  });

  return groups;
}

/**
 * Flatten grouped options into a single array (for validation)
 */
export function flattenInquiryOptions(
  groups: InquiryOptionGroup[]
): InquiryOption[] {
  return groups.flatMap((group) => group.options);
}

/**
 * Check if a value is a valid inquiry question
 */
export function isValidInquiryQuestion(
  value: string,
  sections: string[]
): boolean {
  const groups = generateInquiryOptions(sections);
  const allOptions = flattenInquiryOptions(groups);
  return allOptions.some((option) => option.value === value);
}
